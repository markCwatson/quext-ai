// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.

import confetti from 'canvas-confetti';

const generateQuizBtn = document.getElementById('generate-quiz-btn')!;
const quizContainer = document.getElementById('quiz-container')!;
const questionText = document.getElementById('question-text')!;
const trueBtn = document.getElementById('true-btn') as HTMLButtonElement;
const falseBtn = document.getElementById('false-btn') as HTMLButtonElement;
const feedback = document.getElementById('feedback')!;
const scoreEl = document.getElementById('score')!;
const audioBtn = document.getElementById('play-audio-btn')!;
const defaultText = document.getElementById('default-text')!;
const resultContainer = document.getElementById('result-container')!;
const resultText = document.getElementById('result-text')!;
const tryAgainBtn = document.getElementById('try-again-btn')!;

let score = 0;
let numberOfCorrectAnswers = 0;
let numberOfQuestions = 0;
let responses: { question: string; answer: string }[] = [];

function playConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

function updateScoreUI() {
  if (numberOfQuestions === 0) {
    scoreEl.textContent = '0 %';
    questionText.innerText = 'Click "Generate Quiz" to start';
    return;
  }

  score = Math.floor((numberOfCorrectAnswers / numberOfQuestions) * 100);
  scoreEl.textContent = score.toString() + ' %';
}

function clearFeedback() {
  feedback.innerHTML = '';
  feedback.style.color = '#333';
}

function updatePopup(question: any, answer: any) {
  defaultText.style.display = 'none';
  questionText.innerText = question;
  quizContainer.style.display = 'block';
  feedback.innerText = '';
  numberOfQuestions++;

  if (responses.length === 0) {
    generateQuizBtn.innerText = 'Generate Quiz';
  } else {
    generateQuizBtn.innerText = 'Next Question';
  }

  audioBtn.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return;

      chrome.tabs.sendMessage(
        activeTab.id,
        { type: 'fetchAudio', text: question },
        (response) => {
          if (!response) {
            console.error('No response from fetchAudio');
            return;
          }

          if (!response.success)
            console.error('Audio fetch/play failed:', response.error);
        },
      );
    });
  };

  trueBtn.onclick = () => {
    if (answer.toLowerCase() === 'true') {
      feedback.style.color = 'green';
      feedback.innerText = 'Correct!';
      numberOfCorrectAnswers++;
      playConfetti();
      trueBtn.classList.add('correct');
      trueBtn.disabled = true;
      falseBtn.disabled = true;
    } else {
      feedback.style.color = 'red';
      feedback.innerText = 'Incorrect. The answer is False.';
    }

    updateScoreUI();
  };

  falseBtn.onclick = () => {
    if (answer.toLowerCase() === 'false') {
      feedback.style.color = 'green';
      feedback.innerText = 'Correct!';
      numberOfCorrectAnswers++;
      playConfetti();
      falseBtn.classList.add('correct');
      falseBtn.disabled = true;
      trueBtn.disabled = true;
    } else {
      feedback.style.color = 'red';
      feedback.innerText = 'Incorrect. The answer is True.';
    }

    updateScoreUI();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.action.setBadgeText({ text: '' });

  quizContainer.style.display = 'none';
  clearFeedback();

  chrome.storage.local.get(['lastGeneratedQuiz'], (result) => {
    if (result.lastGeneratedQuiz) {
      const { question, answer } = result.lastGeneratedQuiz;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) updatePopup(question, answer);
      });

      chrome.storage.local.remove('lastGeneratedQuiz');
    }
  });
});

generateQuizBtn?.addEventListener('click', async () => {
  clearFeedback();
  defaultText.style.display = 'block';
  defaultText.innerText = 'Generating a new question...';
  quizContainer.style.display = 'none';

  // Reset buttons
  trueBtn.disabled = false;
  falseBtn.disabled = false;
  trueBtn.classList.remove('correct');
  falseBtn.classList.remove('correct');

  if (responses.length > 0) {
    const response = responses.pop()!;
    if (response) {
      updatePopup(response.question, response.answer);

      if (responses.length === 0) {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultText.innerText = `You have answered ${numberOfCorrectAnswers} out of ${
          numberOfQuestions - 1
        } questions correctly.`;

        tryAgainBtn.onclick = () => {
          numberOfCorrectAnswers = 0;
          numberOfQuestions = 0;
          updateScoreUI();
          resultContainer.style.display = 'none';
          defaultText.style.display = 'block';
          defaultText.innerText = 'Generating a new question...';
          generateQuizBtn.click();
        };
      }
    } else {
      defaultText.innerText = 'Failed to load a question.';
    }
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    defaultText.innerText = 'Failed to fetch page content.';
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'getPageContent' },
    (contentResponse) => {
      if (!contentResponse || !contentResponse.chunks) {
        defaultText.innerText = 'Failed to fetch page content.';
        return;
      }

      try {
        chrome.tabs.sendMessage(
          tab.id!,
          { type: 'generateQuiz', chunks: contentResponse.chunks },
          (quizResponses) => {
            if (!quizResponses || quizResponses.length === 0) {
              defaultText.innerText = 'Failed to generate questions.';
              return;
            }

            responses.push(...quizResponses);

            const nextQuestion = responses.pop();
            if (nextQuestion) {
              updatePopup(nextQuestion.question, nextQuestion.answer);
            } else {
              defaultText.innerText = 'Failed to load a question.';
            }
          },
        );
      } catch (err) {
        console.error('Error generating quiz:', err);
      }
    },
  );
});

generateQuizBtn.innerText = 'Generate Quiz';
resultContainer.style.display = 'none';
defaultText.style.display = 'block';
defaultText.innerText = 'Click "Generate Quiz" to start';
updateScoreUI();
