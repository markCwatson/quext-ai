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
const resultText = document.getElementById('result-text')!;
const tryAgainBtn = document.getElementById('try-again-btn')!;
const spinnerEl = document.getElementById('html-spinner')!;
const scoreText = document.getElementById('score-text')!;

let score: number;
let numberOfCorrectAnswers: number;
let numberOfQuestions: number;
let responses: { question: string; answer: string }[];

function playConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

function init() {
  score = 0;
  numberOfCorrectAnswers = 0;
  numberOfQuestions = 0;
  responses = [];
  generateQuizBtn.innerText = 'Generate Quiz';
  resultText.style.display = 'none';
  tryAgainBtn.style.display = 'none';
  scoreText.innerText = 'Current Score:';
}

function showAsCorrectByButton(btn: HTMLButtonElement) {
  feedback.style.color = 'green';
  feedback.innerText = 'Correct!';
  numberOfCorrectAnswers++;
  playConfetti();
  btn.classList.add('correct');
  falseBtn.disabled = true;
  trueBtn.disabled = true;
}

function showAsIncorrect(ans: string) {
  feedback.style.color = 'red';
  feedback.innerText = `Incorrect. The answer is ${ans}.`;
}

function updateScoreUI() {
  if (numberOfQuestions === 0) {
    scoreEl.textContent = '0 %';
    return;
  }

  score = Math.floor((numberOfCorrectAnswers / numberOfQuestions) * 100);
  scoreEl.textContent = score.toString() + ' %';

  generateQuizBtn.style.display = 'block';
  generateQuizBtn.innerText =
    responses.length > 0 ? 'Next Question' : 'Show Final Score';
}

function clearFeedback() {
  feedback.innerHTML = '';
  feedback.style.color = '#333';
}

function resetButtons() {
  trueBtn.disabled = false;
  falseBtn.disabled = false;
  trueBtn.classList.remove('correct');
  falseBtn.classList.remove('correct');
}

function showSpinner() {
  generateQuizBtn.style.display = 'none';
  spinnerEl.style.display = 'block';
}

function showFinalScore() {
  scoreText.innerText = 'Final Score:';
  generateQuizBtn.style.display = 'none';
  quizContainer.style.display = 'none';
  resultText.style.display = 'block';
  tryAgainBtn.style.display = 'block';
  resultText.innerText = `You answered ${numberOfCorrectAnswers} out of ${numberOfQuestions} questions correctly.`;

  tryAgainBtn.onclick = () => {
    init();
    updateScoreUI();
    generateQuizBtn.click();
  };
}

function showBusyMessage() {
  quizContainer.style.display = 'none';
}

function showQuestion(question: any, answer: any) {
  questionText.innerText = question;
  quizContainer.style.display = 'block';
  feedback.innerText = '';
  generateQuizBtn.style.display = 'none';

  audioBtn.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return;

      chrome.tabs.sendMessage(
        activeTab.id,
        { type: 'fetchAudio', text: question },
        (response) => {
          if (!response || !response.success)
            console.error('No response from fetchAudio');
        },
      );
    });
  };

  trueBtn.onclick = () => {
    answer.toLowerCase() === 'true'
      ? showAsCorrectByButton(trueBtn)
      : showAsIncorrect('True');
    updateScoreUI();
  };

  falseBtn.onclick = () => {
    answer.toLowerCase() === 'false'
      ? showAsCorrectByButton(falseBtn)
      : showAsIncorrect('False');
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
        if (tabs[0]?.id) showQuestion(question, answer);
      });

      chrome.storage.local.remove('lastGeneratedQuiz');
    }
  });
});

generateQuizBtn?.addEventListener('click', async () => {
  clearFeedback();
  showBusyMessage();
  resetButtons();

  if (numberOfQuestions > 0 && responses.length == 0) {
    showFinalScore();
    return;
  }

  if (numberOfQuestions > 0) {
    const next = responses.pop()!;
    if (next) showQuestion(next.question, next.answer);
    return;
  }

  showSpinner();

  // For testing purposes
  generateQuizBtn.style.display = 'block';
  spinnerEl.style.display = 'none';
  const questions = [
    {
      question: 'The moon is made of cheese.',
      answer: 'False',
    },
    {
      question: 'The sky is blue.',
      answer: 'True',
    },
  ];
  responses.push(...questions);
  numberOfQuestions = responses.length;
  const next = responses.pop();
  if (next) showQuestion(next.question, next.answer);

  // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // if (!tab || !tab.id) {
  //   defaultText.innerText = 'Failed to get active tab.';
  //   return;
  // }

  // chrome.tabs.sendMessage(
  //   tab.id,
  //   { type: 'getPageContent' },
  //   (contentResponse) => {
  //     if (!contentResponse || !contentResponse.chunks) {
  //       defaultText.innerText = 'Failed to fetch page content.';
  //       return;
  //     }

  //     try {
  //       chrome.tabs.sendMessage(
  //         tab.id!,
  //         { type: 'generateQuiz', chunks: contentResponse.chunks },
  //         (quizResponses) => {
  //           generateQuizBtn.style.display = 'block';
  //           spinnerEl.style.display = 'none';

  //           if (!quizResponses || quizResponses.length === 0) {
  //             defaultText.innerText = 'Failed to generate questions.';
  //             return;
  //           }

  //           responses.push(...quizResponses);

  //           const next = responses.pop();
  //           if (next) {
  //             updatePopup(next.question, next.answer);
  //           } else {
  //             defaultText.innerText = 'Failed to load a question.';
  //           }
  //         },
  //       );
  //     } catch (err) {
  //       console.error('Error generating quiz:', err);
  //     }
  //   },
  // );
});

init();
updateScoreUI();
