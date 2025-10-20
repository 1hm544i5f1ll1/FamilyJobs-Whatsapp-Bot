import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { Chunk } from './chunk';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

/**
 * Generate embeddings for text chunks
 */
export async function generateEmbeddings(chunks: Chunk[]): Promise<number[][]> {
  if (!process.env['OPENAI_API_KEY']) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  try {
    const texts = chunks.map(chunk => chunk.text);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    logger.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env['OPENAI_API_KEY']) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    logger.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}
