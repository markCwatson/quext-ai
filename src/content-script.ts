// This script runs on the web pages defined in manifest.json.

import AudioHandler from './classes/AudioHandler';
import ContentExtractor from './classes/ContentExtractor';
import QuizGenerator from './classes/QuizGenerator';

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'getPageContent') {
    const content = ContentExtractor.getPageContent();
    sendResponse({ chunks: content });
  } else if (request.type === 'generateQuiz' && request.chunks) {
    chrome.storage.sync.get(['apiKey', 'model'], (data) => {
      if (data.apiKey && data.model) {
        QuizGenerator.setModel(data.model);
        QuizGenerator.setApiKey(data.apiKey);
        QuizGenerator.fetchQuiz(request.chunks).then((responses) =>
          sendResponse(responses),
        );
      }
    });
    return true;
  } else if (request.type === 'fetchAudio' && request.text) {
    AudioHandler.fetchAudio(request.text)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true;
  } else if (request.type === 'getApiSettings') {
    chrome.storage.sync.get(['apiKey', 'model'], (data) => {
      sendResponse(data);
    });
    return true;
  }
});
