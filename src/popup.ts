// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.

const generateQuizBtn = document.getElementById('generate-quiz-btn');

generateQuizBtn?.addEventListener('click', async () => {
  // Example: send a message to the content script to fetch page content
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.id) {
    chrome.tabs.sendMessage(
      tab.id,
      { command: 'getPageContent' },
      (response) => {
        if (response && response.content) {
          // Here you would call your AI model API to generate a quiz from the content
          console.log('Page content received:', response.content);

          // -------------
          // PSEUDO-CODE:
          // -------------
          // const quiz = await generateQuizFromAI(response.content);
          // showQuiz(quiz); // Display the quiz in the popup
        }
      },
    );
  }
});
