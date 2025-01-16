// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.
// It contains event handlers for the UI elements.

import DOMElements from './classes/DOMElements';
import QuizGenerator from './classes/QuizGenerator';
import QuizState from './classes/QuizState';
import QuizUI from './classes/QuizUI';

document.addEventListener('DOMContentLoaded', () => {
  DOMElements.initialize();

  chrome.storage.sync.get(['apiKey', 'model'], (data) => {
    if (data.apiKey && data.model) {
      QuizState.init();
      QuizUI.init();
      return;
    }

    if (!QuizGenerator.apikey || QuizGenerator.apikey === '') {
      QuizUI.showOptionsPrompt();
    }
  });

  chrome.storage.local.get(['lastGeneratedQuiz'], (result) => {
    chrome.action.setBadgeText({ text: '' });

    if (result.lastGeneratedQuiz) {
      QuizState.addResponses([result.lastGeneratedQuiz]);
      chrome.storage.local.remove('lastGeneratedQuiz');
      DOMElements.nextBtn?.click();
    }
  });

  const openOptionsPage = () =>
    chrome.runtime.openOptionsPage(() => {
      if (chrome.runtime.lastError) {
        alert('Failed to open options page.');
      }
    });

  DOMElements.optionsBtn?.addEventListener('click', openOptionsPage);
  DOMElements.openOptionsBtn?.addEventListener('click', openOptionsPage);

  DOMElements.generateQuizBtn?.addEventListener(
    'click',
    function (event: MouseEvent) {
      // 1. get the mouse position relative to the button
      const mouseX = event.clientX - DOMElements.btn.offsetLeft;
      const mouseY = event.clientY - DOMElements.btn.offsetTop;
      const offsetWidth = DOMElements.btn.offsetWidth;
      const offsetHeight = DOMElements.btn.offsetHeight;

      // 2. calculate the distance from the mouse to each side of the button
      const directions = [
        { id: 'top', x: offsetWidth / 2, y: 0 },
        { id: 'right', x: offsetWidth, y: offsetHeight / 2 },
        { id: 'bottom', x: offsetWidth / 2, y: offsetHeight },
        { id: 'left', x: 0, y: offsetHeight / 2 },
      ];

      const distance = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
      ): number => {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
      };

      // 3. sort the sides by distance to the mouse
      directions.sort((a, b) => {
        return (
          distance(mouseX, mouseY, a.x, a.y) -
          distance(mouseX, mouseY, b.x, b.y)
        );
      });

      // 4. set the direction attribute of the button to the closest side
      DOMElements.btn?.setAttribute('data-direction', directions[0].id);
      DOMElements.btn?.classList.add('is-open');

      // 5. focus on the number input
      DOMElements.numberInput.focus();
    },
  );

  DOMElements.btnCancel?.addEventListener('click', QuizUI.close);

  DOMElements.btnSubmit?.addEventListener('click', () => {
    const input = parseInt(DOMElements.numberInput.value);
    if (input < 1) {
      alert('Please enter a number greater than 0');
      return;
    }

    if (input > 10) {
      alert('Please enter a number less than 10');
      return;
    }

    QuizState.setMaxNumberOfQuestions(parseInt(DOMElements.numberInput.value));
    QuizUI.closeMaxNumQuestionsInputButton();
    DOMElements.nextBtn.click();
  });

  DOMElements.nextBtn?.addEventListener('click', async () => {
    QuizUI.clearFeedback();
    QuizUI.showBusyMessage();
    QuizUI.resetAnswerButtons();

    if (
      QuizState.getNumberOfQuestions() > 0 &&
      QuizState.getResponses().length == 0
    ) {
      QuizUI.showFinalScoreButton();
      return;
    }

    if (QuizState.getNumberOfQuestions() > 0) {
      const next = QuizState.popResponse();
      if (next) QuizUI.showQuestion(next.question, next.answer);
      return;
    }

    QuizUI.showSpinner();

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { type: 'getPageContent' },
      (contentResponse) => {
        if (!contentResponse || !contentResponse.chunks) return;

        try {
          chrome.tabs.sendMessage(
            tab.id!,
            { type: 'generateQuiz', chunks: contentResponse.chunks },
            (quizResponses) => {
              QuizUI.hideSpinner();

              if (!quizResponses || quizResponses.length === 0) return;

              QuizState.addResponses(quizResponses);
              const next = QuizState.popResponse();
              if (next) QuizUI.showQuestion(next.question, next.answer);
            },
          );
        } catch (err) {
          alert('Error generating quiz:');
        }
      },
    );
  });
});
