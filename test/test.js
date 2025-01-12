import fetch from 'node-fetch';

const OPENAI_API_KEY =
  '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';

async function generateQuizFromAI(content) {
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
    alert('Failed to get AI response:', data);
    return parsed;
  }

  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    alert('Failed to parse AI response as JSON:', raw);
  }

  return parsed; // {question, answer}
}

const { question, answer } = await generateQuizFromAI(
  'The moon is not made of cheese.',
);
console.log('Question:', question);
console.log('Answer:', answer);
