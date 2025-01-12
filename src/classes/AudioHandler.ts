class AudioHandler {
  static async fetchAudio(text: string): Promise<void> {
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
          this.playAudio((reader.result as string).split(',')[1]);
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

  private static playAudio(audioData: string): void {
    let audioBlob = new Blob(
      [Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))],
      { type: 'audio/mp3' },
    );
    let audioUrl = URL.createObjectURL(audioBlob);

    let audio = new Audio(audioUrl);
    audio.play().catch((err) => alert('Audio playback error:'));

    // Clean up the URL after playback
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  }
}

export default AudioHandler;
