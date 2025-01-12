import confetti from 'canvas-confetti';
import DOMElements from './DOMElements';
import QuizState from './QuizState';

class QuizUI {
  static init() {
    DOMElements.optionsPrompt.style.display = 'none';

    DOMElements.quizAppContainer.style.display = 'flex';
    DOMElements.resultContainer.style.display = 'none';
    DOMElements.quizContainer.style.display = 'none';
    DOMElements.feedback.style.display = 'none';

    DOMElements.generateQuizBtn.innerText = 'Generate Quiz';
    DOMElements.tryAgainBtn.style.display = 'none';

    DOMElements.resultText.style.display = 'none';
    DOMElements.scoreEl.style.display = 'none';
    DOMElements.scoreText.style.display = 'none';
  }

  static showOptionsPrompt() {
    DOMElements.optionsPrompt.style.display = 'block';
    DOMElements.quizAppContainer.style.display = 'none';
  }

  static showAsCorrectByButton(btn: HTMLButtonElement) {
    DOMElements.feedback.style.color = 'green';
    DOMElements.feedback.innerText = 'Correct!';
    QuizState.incrementScore();
    this.playConfetti();
    btn.classList.add('correct');
    DOMElements.falseBtn.disabled = true;
    DOMElements.trueBtn.disabled = true;
  }

  static showAsIncorrect(wrongButton: HTMLButtonElement, ans: string) {
    wrongButton.classList.add('wrong-answer');

    wrongButton.addEventListener('animationend', () => {
      wrongButton.classList.remove('wrong-answer');
    });

    DOMElements.feedback.style.color = 'red';
    DOMElements.feedback.innerText = `Incorrect. The answer is ${ans}.`;
  }

  static clearFeedback() {
    DOMElements.feedback.innerHTML = '';
    DOMElements.feedback.style.color = '#333';
  }

  static resetButtons() {
    DOMElements.trueBtn.disabled = false;
    DOMElements.falseBtn.disabled = false;
    DOMElements.trueBtn.classList.remove('correct');
    DOMElements.falseBtn.classList.remove('correct');
  }

  static showSpinner() {
    DOMElements.generateQuizBtn.style.display = 'none';
    DOMElements.spinnerEl.style.display = 'block';
  }

  static hideSpinner() {
    DOMElements.generateQuizBtn.style.display = 'block';
    DOMElements.spinnerEl.style.display = 'none';
  }

  static showBusyMessage() {
    DOMElements.quizContainer.style.display = 'none';
  }

  static showFinalScore() {
    DOMElements.scoreText.innerText = 'Final Score:';
    DOMElements.scoreText.style.display = 'block';
    DOMElements.scoreEl.style.display = 'block';
    DOMElements.generateQuizBtn.style.display = 'none';
    DOMElements.feedback.style.display = 'none';
    DOMElements.quizContainer.style.display = 'none';
    DOMElements.tryAgainBtn.style.display = 'block';
    DOMElements.resultContainer.style.display = 'flex';
    DOMElements.resultText.style.display = 'block';
    DOMElements.resultText.innerText = `You answered ${QuizState.numberOfCorrectAnswers} out of ${QuizState.numberOfQuestions} questions correctly.`;

    DOMElements.tryAgainBtn.onclick = () => {
      this.init();
      QuizState.init();
      QuizState.updateScore();
      DOMElements.generateQuizBtn.click();
    };
  }

  static updateScoreUi() {
    DOMElements.scoreEl.textContent = QuizState.score.toString() + ' %';
    DOMElements.generateQuizBtn.style.display = 'block';
    DOMElements.generateQuizBtn.innerText =
      QuizState.responses.length > 0 ? 'Next Question' : 'Show Final Score';
  }

  static showQuestion(question: any, answer: any) {
    DOMElements.questionText.innerText = question;
    DOMElements.quizContainer.style.display = 'block';
    DOMElements.feedback.style.display = 'block';
    DOMElements.feedback.innerText = '';
    DOMElements.generateQuizBtn.style.display = 'none';

    DOMElements.audioBtn.onclick = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) return;

        chrome.tabs.sendMessage(
          activeTab.id,
          { type: 'fetchAudio', text: question },
          (response) => {
            if (!response || !response.success)
              alert('No response from fetchAudio');
          },
        );
      });
    };

    DOMElements.trueBtn.onclick = () => {
      answer.toLowerCase() === 'true'
        ? this.showAsCorrectByButton(DOMElements.trueBtn)
        : this.showAsIncorrect(DOMElements.trueBtn, 'False');

      QuizState.updateScore();
      this.updateScoreUi();
    };

    DOMElements.falseBtn.onclick = () => {
      answer.toLowerCase() === 'false'
        ? this.showAsCorrectByButton(DOMElements.falseBtn)
        : this.showAsIncorrect(DOMElements.falseBtn, 'True');

      QuizState.updateScore();
      this.updateScoreUi();
    };
  }

  static playConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}

export default QuizUI;