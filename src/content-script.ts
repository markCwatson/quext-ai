// This script runs on the web pages defined in manifest.json.

import { send } from 'process';

// \todo: move call to custom api
const OPENAI_API_KEY =
  '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';

async function fetchQuiz(
  content: string,
): Promise<{ question: string; answer: string }> {
  let data: { choices: { message: { content: string } }[] };
  let parsed = { question: '', answer: '' };

  try {
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

    data = await response.json();
  } catch (error) {
    console.error('Failed to generate quiz from AI:', error);
    return parsed;
  }

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

  return parsed;
}

async function fetchAudio(text: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        'https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=' +
          encodeURIComponent(text.trim()),
      );

      if (response.status !== 200) {
        const errText = await response.text();
        return reject(new Error('Failed to get audio. ' + errText));
      }

      const mp3Blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        // Play the audio directly in the content script
        playAudio((reader.result as string).split(',')[1]);
        resolve();
      };

      reader.onerror = () => {
        reject(new Error('Error reading MP3 blob via FileReader'));
      };

      reader.readAsDataURL(mp3Blob);
    } catch (err) {
      reject(err);
    }
  });
}

function playAudio(audioData: string): void {
  let audioBlob = new Blob(
    [Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))],
    { type: 'audio/mp3' },
  );
  let audioUrl = URL.createObjectURL(audioBlob);

  let audio = new Audio(audioUrl);
  audio.play().catch((err) => console.error('Audio playback error:', err));

  // Clean up the URL after playback
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
}

function getPageContent(): string {
  return document.body.innerText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getPageContent') {
    const content = getPageContent();
    sendResponse({ content });
  } else if (request.type === 'generateQuiz' && request.content) {
    fetchQuiz(request.content).then((response) => sendResponse(response));
    return true;
  } else if (request.type === 'fetchAudio' && request.text) {
    fetchAudio(request.text)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true;
  }
});
