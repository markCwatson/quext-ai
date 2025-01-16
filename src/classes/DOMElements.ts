class DOMElements {
  static quizAppContainer: HTMLElement;
  static quizContainer: HTMLElement;
  static questionText: HTMLElement;
  static trueBtn: HTMLButtonElement;
  static falseBtn: HTMLButtonElement;
  static feedback: HTMLElement;
  static scoreEl: HTMLElement;
  static audioBtn: HTMLElement;
  static resultText: HTMLElement;
  static tryAgainBtn: HTMLElement;
  static spinnerEl: HTMLElement;
  static scoreText: HTMLElement;
  static apiKeyInput: HTMLInputElement;
  static modelSelect: HTMLInputElement;
  static optionsForm: HTMLElement;
  static optionsPrompt: HTMLElement;
  static clearBtn: HTMLElement;
  static openOptionsBtn: HTMLElement;
  static resultContainer: HTMLElement;
  static optionsBtn: HTMLElement;
  static btn: HTMLElement;
  static generateQuizBtn: HTMLElement;
  static btnSubmit: HTMLElement;
  static btnCancel: HTMLElement;
  static numberInput: HTMLInputElement;
  static btnBack: HTMLElement;
  static nextBtn: HTMLElement;

  static initialize() {
    this.quizAppContainer = document.getElementById(
      'quiz-app-container',
    ) as HTMLElement;
    this.quizContainer = document.getElementById(
      'quiz-container',
    ) as HTMLElement;

    this.questionText = document.getElementById('question-text') as HTMLElement;
    this.trueBtn = document.getElementById('true-btn') as HTMLButtonElement;
    this.falseBtn = document.getElementById('false-btn') as HTMLButtonElement;
    this.feedback = document.getElementById('feedback') as HTMLElement;
    this.scoreEl = document.getElementById('score') as HTMLElement;
    this.audioBtn = document.getElementById('play-audio-btn') as HTMLElement;
    this.resultText = document.getElementById('result-text') as HTMLElement;
    this.tryAgainBtn = document.getElementById('try-again-btn') as HTMLElement;
    this.spinnerEl = document.getElementById('html-spinner') as HTMLElement;
    this.scoreText = document.getElementById('score-text') as HTMLElement;
    this.apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
    this.modelSelect = document.getElementById('model') as HTMLInputElement;
    this.optionsForm = document.getElementById('options-form') as HTMLElement;
    this.nextBtn = document.getElementById('next-btn') as HTMLElement;
    this.optionsPrompt = document.getElementById(
      'setup-container',
    ) as HTMLElement;
    this.clearBtn = document.getElementById('clear') as HTMLElement;
    this.openOptionsBtn = document.getElementById(
      'open-options-btn',
    ) as HTMLElement;
    this.resultContainer = document.getElementById(
      'result-container',
    ) as HTMLElement;
    this.optionsBtn = document.getElementById('options-button') as HTMLElement;

    this.btn = document.querySelector('.btn') as HTMLElement;
    this.generateQuizBtn = document.getElementById(
      'generate-quiz-btn',
    ) as HTMLElement;
    this.btnBack = document.querySelector('.btn-back') as HTMLElement;
    this.btnSubmit = document.querySelector('.btn-back .submit') as HTMLElement;
    this.btnCancel = document.querySelector('.btn-back .cancel') as HTMLElement;
    this.numberInput = document.querySelector(
      '.number-input',
    ) as HTMLInputElement;
  }
}

export default DOMElements;
