console.log('Quext AI background script running...');

// In Manifest V3, this runs as a service worker, so it may be short-lived.
// You can listen to Chrome events and do tasks like messaging between content scripts and popup here.
chrome.runtime.onInstalled.addListener(() => {
  console.log('Quext AI installed successfully!');
});
