import DOMElements from './DOMElements';
import QuizGenerator from './QuizGenerator';

class OptionsUI {
  static init() {
    DOMElements.apiKeyInput.value = '';
    DOMElements.modelSelect.value = QuizGenerator.DEFAULT_MODEL;
  }

  static setApiKey(apiKey: string) {
    DOMElements.apiKeyInput.value = apiKey;
  }

  static setModel(model: string) {
    DOMElements.modelSelect.value = model;
  }

  static getApiKey(): string {
    return DOMElements.apiKeyInput.value;
  }

  static getModel(): string {
    return DOMElements.modelSelect.value;
  }
}

export default OptionsUI;
