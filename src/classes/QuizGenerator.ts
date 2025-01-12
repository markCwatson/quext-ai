class QuizGenerator {
  // \todo: move call to custom api
  private static _key =
    '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';

  // for testing
  static fetchQuizMock(
    chunks: string[],
  ): Promise<{ question: string; answer: string }[]> {
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

  static async fetchQuiz(
    chunks: string[],
  ): Promise<{ question: string; answer: string }[]> {
    const responses: { question: string; answer: string }[] = [];

    // Shuffle chunks and select up to 5
    const randomChunks = chunks
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, chunks.length));

    for (const chunk of randomChunks) {
      try {
        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${QuizGenerator._key}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `You are a helpful quiz generator. Generate a single true or false question and answer in JSON format: { "question": "The question", "answer": "True or False" }. You can change the wording however you see fit making it either true or false. It is preferred if you do not simply repeat the text.`,
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
        console.error('Error fetching quiz:', error);
      }
    }

    return responses;
  }
}

export default QuizGenerator;
