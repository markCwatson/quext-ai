console.log('Quext AI content script injected!');

// This script runs on the web pages you match in manifest.json.
// For instance, you might collect page text here or respond to messages from the popup.

function getPageContent(): string {
  // As a simple example, return the body text
  return document.body.innerText;
}

// Listen for messages from the popup or background service worker (if needed)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.command !== 'getPageContent')
    return console.error(
      'Invalid command received in content script:',
      request.command,
    );

  const content = getPageContent();
  sendResponse({ content });
});
