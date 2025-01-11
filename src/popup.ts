// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.

const generateQuizBtn = document.getElementById('generate-quiz-btn')!;
const quizContainer = document.getElementById('quiz-container')!;
const questionText = document.getElementById('question-text')!;
const trueBtn = document.getElementById('true-btn')!;
const falseBtn = document.getElementById('false-btn')!;
const feedback = document.getElementById('feedback')!;
const scoreEl = document.getElementById('score')!;
const audioBtn = document.getElementById('play-audio-btn')!;

let score = 0;
let numberOfCorrectAnswers = 0;
let numberOfQuestions = 0;

function updateScoreUI() {
  if (numberOfQuestions === 0) {
    scoreEl.textContent = '0 %';
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
  questionText.innerText = question;
  quizContainer.style.display = 'block';
  feedback.innerText = '';
  numberOfQuestions++;

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
          if (!response.success) {
            console.error('Audio fetch/play failed:', response.error);
          }
        },
      );
    });
  };

  trueBtn.onclick = () => {
    if (answer.toLowerCase() === 'true') {
      feedback.style.color = 'green';
      feedback.innerText = 'Correct!';
      numberOfCorrectAnswers++;
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
    } else {
      feedback.style.color = 'red';
      feedback.innerText = 'Incorrect. The answer is True.';
    }

    updateScoreUI();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // Clear the badge when popup is opened
  chrome.action.setBadgeText({ text: '' });

  // Initialize UI elements to their default states
  quizContainer.style.display = 'none';
  questionText.textContent = 'Click "Generate Question" to start';
  clearFeedback();

  // Check for stored quiz
  chrome.storage.local.get(['lastGeneratedQuiz'], (result) => {
    if (result.lastGeneratedQuiz) {
      const { question, answer } = result.lastGeneratedQuiz;

      // Get the current tab to pass to updatePopup
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          updatePopup(question, answer);
        }
      });

      // Clear the stored quiz after displaying it
      chrome.storage.local.remove('lastGeneratedQuiz');
    }
  });
});

// document.addEventListener('DOMContentLoaded', () => {
//   console.log('Popup loaded, checking for stored quiz...');

//   // Initialize UI elements to their default states
//   quizContainer.style.display = 'none';
//   questionText.textContent = 'Click "Generate Question" to start';
//   clearFeedback();

//   // Check for stored quiz
//   chrome.storage.local.get(['lastGeneratedQuiz'], (result) => {
//     console.log('Storage check result:', result);

//     if (result.lastGeneratedQuiz) {
//       const { question, answer } = result.lastGeneratedQuiz;
//       console.log('Found stored quiz:', { question, answer });

//       // Get the current tab to pass to updatePopup
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs[0]?.id) {
//           console.log('Updating popup with stored quiz');
//           updatePopup(question, answer);
//         }
//       });

//       // Clear the stored quiz after displaying it
//       chrome.storage.local.remove('lastGeneratedQuiz', () => {
//         console.log('Cleared stored quiz');
//       });
//     } else {
//       console.log('No stored quiz found');
//     }
//   });
// });

generateQuizBtn?.addEventListener('click', async () => {
  clearFeedback();
  questionText.textContent = 'Generating a new question...';
  quizContainer.style.display = 'none';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id)
    return console.error('Could not find active tab to fetch page content.');

  chrome.tabs.sendMessage(tab.id, { type: 'getPageContent' }, (response) => {
    if (!response || !response.content)
      return console.error('Failed to get page content from content script.');

    try {
      chrome.tabs.sendMessage(
        tab.id!,
        { type: 'generateQuiz', content: response.content },
        (response) => {
          if (!response || !response.question || !response.answer) {
            questionText.innerText = 'Failed to generate question.';
            return;
          }

          updatePopup(response.question, response.answer);
        },
      );
    } catch (err) {
      console.error('Error generating quiz:', err);
    }
  });
});

updateScoreUI();
