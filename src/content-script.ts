// This script runs on the web pages defined in manifest.json.

// \todo: move call to custom api
const OPENAI_API_KEY =
  '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';

async function fetchQuiz(
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
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a helpful quiz generator. Generate a single true or false question and answer in JSON format: { "question": "The question", "answer": "True or False" }.`,
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

function getPageContent(): string[] {
  const content = document.body.innerText.replace(/\s+/g, ' ').trim();
  const chunkSize = 4000;
  const chunks: string[] = [];
  let currentChunk = '';

  content.split('. ').forEach((sentence) => {
    if (currentChunk.length + sentence.length + 1 <= chunkSize) {
      currentChunk += sentence + '. ';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + '. ';
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'getPageContent') {
    const content = getPageContent();
    sendResponse({ chunks: content });
  } else if (request.type === 'generateQuiz' && request.chunks) {
    fetchQuiz(request.chunks).then((responses) => sendResponse(responses));
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
