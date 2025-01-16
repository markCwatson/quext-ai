export interface IQuestionAndAnswer {
  question: string;
  answer: string;
}

class QuizState {
  static score: number;
  static numberOfCorrectAnswers: number;
  static numberOfQuestions: number;
  static responses: IQuestionAndAnswer[];
  static maxNumberOfQuestions: number;

  static init() {
    this.score = 0;
    this.numberOfCorrectAnswers = 0;
    this.numberOfQuestions = 0;
    this.responses = [];
    this.maxNumberOfQuestions = 0;
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

  static getResponses() {
    return this.responses;
  }

  static getNumberOfQuestions() {
    return this.numberOfQuestions;
  }

  static popResponse() {
    return this.responses.pop();
  }

  static setMaxNumberOfQuestions(num: number) {
    this.maxNumberOfQuestions = num;
    // for chrome runtime listeners which run in the background thus do not have access to QuizState
    chrome.storage.sync.set({ maxNumberOfQuestions: num });
  }
}

export default QuizState;
