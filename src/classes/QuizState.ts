import DOMElements from './DOMElements';

class QuizState {
  static score: number;
  static numberOfCorrectAnswers: number;
  static numberOfQuestions: number;
  static responses: { question: string; answer: string }[];

  static init() {
    this.score = 0;
    this.numberOfCorrectAnswers = 0;
    this.numberOfQuestions = 0;
    this.responses = [];
  }

  static updateScore() {
    this.score = Math.floor(
      (this.numberOfCorrectAnswers / this.numberOfQuestions) * 100,
    );
  }

  static incrementScore() {
    this.numberOfCorrectAnswers++;
    this.updateScore();
  }
}

export default QuizState;
