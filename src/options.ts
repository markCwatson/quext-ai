import DOMElements from './classes/DOMElements';
import OptionsUI from './classes/OptionsUI';
import QuizGenerator from './classes/QuizGenerator';

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['apiKey', 'model'], (data) => {
    if (data.apiKey && data.model) {
      OptionsUI.setApiKey(data.apiKey);
      OptionsUI.setModel(data.model);
      return;
    }
  });
});

DOMElements.optionsForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const apiKey = OptionsUI.getApiKey();
  const model = OptionsUI.getModel();
  QuizGenerator.setApiKey(apiKey);
  QuizGenerator.setModel(model);

  chrome.storage.sync.set({ apiKey, model }, () => {
    alert('Settings saved!');
    chrome.tabs.getCurrent((tab) => {
      if (tab?.id) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
});

DOMElements.clearBtn?.addEventListener('click', () => {
  chrome.storage.sync.clear(() => {
    OptionsUI.init();
    QuizGenerator.setApiKey(null);
    QuizGenerator.setModel(QuizGenerator.DEFAULT_MODEL);
    alert('Settings cleared!');
  });
});
