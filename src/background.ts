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
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'generateQuiz', chunks: [info.selectionText.trim()] },
      async (responses) => {
        if (!responses || responses.length === 0) {
          console.error('Failed to generate quiz');
          return;
        }

        await chrome.storage.local.set({
          lastGeneratedQuiz: responses[0],
        });

        chrome.action.setBadgeText({ text: '1' });
        chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });

        // close popup: \toso: this doesn't work??
        // setTimeout(() => {
        //   chrome.action.setPopup({ tabId: tab.id, popup: '' });
        // }, 200);
      },
    );
  }
});
