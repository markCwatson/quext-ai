// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.
// It contains event handlers for the UI elements.

import DOMElements from './classes/DOMElements';
import QuizState from './classes/QuizState';
import QuizUI from './classes/QuizUI';

document.addEventListener('DOMContentLoaded', () => {
  chrome.action.setBadgeText({ text: '' });

  DOMElements.quizContainer.style.display = 'none';
  QuizUI.clearFeedback();

  chrome.storage.local.get(['lastGeneratedQuiz'], (result) => {
    if (result.lastGeneratedQuiz) {
      const { question, answer } = result.lastGeneratedQuiz;
      QuizState.responses.push({ question, answer });
      QuizState.numberOfQuestions = 1;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) DOMElements.generateQuizBtn.click();
      });

      chrome.storage.local.remove('lastGeneratedQuiz');
    }
  });
});

DOMElements.generateQuizBtn?.addEventListener('click', async () => {
  QuizUI.clearFeedback();
  QuizUI.showBusyMessage();
  QuizUI.resetButtons();

  if (QuizState.numberOfQuestions > 0 && QuizState.responses.length == 0) {
    QuizUI.showFinalScore();
    return;
  }

  if (QuizState.numberOfQuestions > 0) {
    const next = QuizState.responses.pop()!;
    if (next) QuizUI.showQuestion(next.question, next.answer);
    return;
  }

  QuizUI.showSpinner();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
            DOMElements.generateQuizBtn.style.display = 'block';
            DOMElements.spinnerEl.style.display = 'none';

            if (!quizResponses || quizResponses.length === 0) return;

            QuizState.responses.push(...quizResponses);
            QuizState.numberOfQuestions = QuizState.responses.length;
            const next = QuizState.responses.pop();
            if (next) QuizUI.showQuestion(next.question, next.answer);
          },
        );
      } catch (err) {
        console.error('Error generating quiz:', err);
      }
    },
  );
});

QuizState.init();
QuizUI.init();
QuizState.updateScore();
