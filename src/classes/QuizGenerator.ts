import QuizState, { IQuestionAndAnswer } from './QuizState';

class QuizGenerator {
  static get DEFAULT_MODEL(): string {
    return 'gpt-4o-mini';
  }

  static apikey: string | null = null;
  static model: string = this.DEFAULT_MODEL;
  static maxNumberOfQuestions = 3;

  static setApiKey(apikey: string | null): void {
    this.apikey = apikey;
  }

  static setModel(model: string): void {
    this.model = model;
  }

  static setMaxNumberOfQuestions(num: number): void {
    this.maxNumberOfQuestions = num;
  }

  // for testing to avoid calling the open ai api too much
  static fetchQuizMock(chunks: string[]): Promise<IQuestionAndAnswer[]> {
    return new Promise((resolve) => {
      resolve([
        {
          question: 'The earth is flat',
          answer: 'False',
        },
        {
          question: 'The sky is blue',
          answer: 'True',
        },
      ]);
    });
  }

  static async fetchQuiz(chunks: string[]): Promise<IQuestionAndAnswer[]> {
    const responses: IQuestionAndAnswer[] = [];

    if (!this.apikey) {
      console.log('API key not set! Go to the options page to set it.');
      alert('API key not set! Go to the options page to set it.');
      return responses;
    }

    // Shuffle chunks and select up to maxNumberOfQuestions
    const randomChunks = chunks
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(this.maxNumberOfQuestions, chunks.length));

    for (const chunk of randomChunks) {
      let answer = Math.random() < 0.5 ? 'True' : 'False';

      try {
        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apikey}`,
            },
            body: JSON.stringify({
              model: this.model || this.DEFAULT_MODEL,
              messages: [
                {
                  role: 'system',
                  content: `You are a helpful quiz generator. Generate a single true or false question and answer in JSON format like this: { "question": "The question", "answer": "True or False" }. You can change the wording however you see fit: do not simply repeat the text. Generate the question such that the answer is "${answer}".`,
                },
                {
                  role: 'user',
                  content: `Reword this text and generate a true or false question: ${chunk}`,
                },
              ],
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        let raw = data.choices?.[0]?.message?.content?.trim();

        if (!raw) {
          throw new Error('Empty response from OpenAI.');
        }

        // Sanitize the response to remove backticks or other unwanted characters
        raw = raw.replace(/```json|```/g, '').trim();

        try {
          const parsed = JSON.parse(raw);
          responses.push(parsed);
        } catch (err) {
          throw new Error(`Failed to parse JSON: ${raw}`);
        }
      } catch (error) {
        alert('Error fetching quiz:');
      }
    }

    return responses;
  }
}

export default QuizGenerator;
