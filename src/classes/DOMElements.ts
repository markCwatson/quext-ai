class DOMElements {
  static generateQuizBtn = document.getElementById('generate-quiz-btn')!;
  static quizContainer = document.getElementById('quiz-container')!;
  static questionText = document.getElementById('question-text')!;
  static trueBtn = document.getElementById('true-btn') as HTMLButtonElement;
  static falseBtn = document.getElementById('false-btn') as HTMLButtonElement;
  static feedback = document.getElementById('feedback')!;
  static scoreEl = document.getElementById('score')!;
  static audioBtn = document.getElementById('play-audio-btn')!;
  static resultText = document.getElementById('result-text')!;
  static tryAgainBtn = document.getElementById('try-again-btn')!;
  static spinnerEl = document.getElementById('html-spinner')!;
  static scoreText = document.getElementById('score-text')!;
}

export default DOMElements;
