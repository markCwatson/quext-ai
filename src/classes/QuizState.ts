export interface IQuestionAndAnswer {
  question: string;
  answer: string;
}

class QuizState {
  static score: number;
  static numberOfCorrectAnswers: number;
  static numberOfQuestions: number;
  static responses: IQuestionAndAnswer[];

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

  static addResponses(responses: IQuestionAndAnswer[]) {
    this.responses.push(...responses);
    this.numberOfQuestions = this.responses.length;
  }

  static popResponse() {
    return this.responses.pop();
  }
}

export default QuizState;
