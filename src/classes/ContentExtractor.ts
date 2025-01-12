class ContentExtractor {
  static getPageContent(): string[] {
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
}

export default ContentExtractor;
