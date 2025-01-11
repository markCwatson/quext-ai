// This script is loaded in the popup.html
// It can communicate with the content script or background script to perform actions.

const generateQuizBtn = document.getElementById(
  'generate-quiz-btn',
) as HTMLButtonElement;
const quizContainer = document.getElementById(
  'quiz-container',
) as HTMLDivElement;
const questionText = document.getElementById(
  'question-text',
) as HTMLParagraphElement;
const trueBtn = document.getElementById('true-btn') as HTMLButtonElement;
const falseBtn = document.getElementById('false-btn') as HTMLButtonElement;
const feedback = document.getElementById('feedback') as HTMLDivElement;

// \todo: move call to custom api
const OPENAI_API_KEY =
  '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';

async function generateQuizFromAI(
  content: string,
): Promise<{ question: string; answer: string }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful quiz generator. 
              When given some text, generate a single true/false question and the correct answer.
              Respond in valid JSON with the format:
              {
                "question": "The question here",
                "answer": "True" or "False"
              }
              Do not include any extra text outside the JSON.`,
        },
        {
          role: 'user',
          content: `Generate a true/false question from this information: ${content}`,
        },
      ],
    }),
  });

  const data = await response.json();
  // e.g., data.choices[0].message.content = '{"question":"...","answer":"True"}'
  let parsed = { question: '', answer: '' };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    console.error('Failed to get AI response:', data);
    return parsed;
  }

  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', raw);
  }

  return parsed; // {question, answer}
}

generateQuizBtn?.addEventListener('click', async () => {
  // Example: send a message to the content script to fetch page content
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id)
    return console.error('Could not find active tab to fetch page content.');

  chrome.tabs.sendMessage(
    tab.id,
    { command: 'getPageContent' },
    async (response) => {
      if (!response || !response.content)
        return console.error('Failed to get page content from content script.');

      try {
        const { question, answer } = await generateQuizFromAI(response.content);
        console.log('Question:', question);
        console.log('Answer:', answer);

        // Show question in the popup
        questionText.innerText = question;
        quizContainer.style.display = 'block';
        feedback.innerText = ''; // Clear old feedback

        // Listen for user clicks
        trueBtn.onclick = () => {
          if (answer.toLowerCase() === 'true') {
            feedback.style.color = 'green';
            feedback.innerText = 'Correct!';
          } else {
            feedback.style.color = 'red';
            feedback.innerText = 'Incorrect. The answer is False.';
          }
        };

        falseBtn.onclick = () => {
          if (answer.toLowerCase() === 'false') {
            feedback.style.color = 'green';
            feedback.innerText = 'Correct!';
          } else {
            feedback.style.color = 'red';
            feedback.innerText = 'Incorrect. The answer is True.';
          }
        };
      } catch (err) {
        console.error('Error generating quiz:', err);
      }
    },
  );
});
