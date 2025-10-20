/**
 * Text chunking utilities for RAG
 */

export interface Chunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

/**
 * Split text into chunks with overlap
 */
export function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): Chunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  const sentences = splitIntoSentences(text);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if (!sentence) continue;
    
    // If adding this sentence would exceed chunk size, finalize current chunk
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        metadata: {
          source: 'source.txt',
          chunkIndex,
          totalChunks: 0 // Will be updated later
        }
      });
      
      // Start new chunk with overlap
      currentChunk = getOverlapText(currentChunk, overlap) + sentence;
      chunkIndex++;
    } else {
      currentChunk += sentence;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chunk_${chunkIndex}`,
      text: currentChunk.trim(),
      metadata: {
        source: 'source.txt',
        chunkIndex,
        totalChunks: 0
      }
    });
  }
  
  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });
  
  return chunks;
}

/**
 * Split text into sentences while preserving punctuation
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries but keep the punctuation
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  // If no sentences found, split by paragraphs
  if (sentences.length === 0) {
    return text.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  }
  
  return sentences;
}

/**
 * Get overlap text from the end of a chunk
 */
function getOverlapText(chunk: string, overlapSize: number): string {
  if (chunk.length <= overlapSize) {
    return chunk + ' ';
  }
  
  // Find the last sentence that fits in the overlap
  const words = chunk.split(' ');
  let overlapText = '';
  
  for (let i = words.length - 1; i >= 0; i--) {
    const testText = words.slice(i).join(' ');
    if (testText.length <= overlapSize) {
      overlapText = testText + ' ';
      break;
    }
  }
  
  return overlapText;
}
