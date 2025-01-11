chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generateQuestion',
    title: 'Quext AI: Generate a question from this!',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    info.menuItemId === 'generateQuestion' &&
    info.selectionText &&
    info.selectionText.trim() !== '' &&
    tab?.id
  ) {
    // First generate the quiz using the content script
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'generateQuiz', content: info.selectionText.trim() },
      async (response) => {
        if (!response || !response.question || !response.answer) {
          console.error('Failed to generate quiz');
          return;
        }

        await chrome.storage.local.set({
          lastGeneratedQuiz: response,
        });

        // Set a badge to notify user that a question is ready
        chrome.action.setBadgeText({ text: '1' });
        chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      },
    );
  }
});
