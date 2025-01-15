// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.
// It contains event handlers for the UI elements.

import DOMElements from './classes/DOMElements';
import QuizGenerator from './classes/QuizGenerator';
import QuizState from './classes/QuizState';
import QuizUI from './classes/QuizUI';

document.addEventListener('DOMContentLoaded', () => {
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
      DOMElements.generateQuizBtn.click();
    }
  });
});

DOMElements.optionsBtn?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage(() => {
    if (chrome.runtime.lastError) {
      alert('Failed to open options page.');
    }
  });
});

DOMElements.openOptionsBtn?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage(() => {
    if (chrome.runtime.lastError) {
      alert('Failed to open options page.');
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
    const next = QuizState.popResponse();
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
