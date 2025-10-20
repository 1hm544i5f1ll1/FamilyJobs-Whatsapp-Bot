import { generateEmbedding } from './embed';
import { cosineSimilarity } from '../utils/cosine';
import { getSourceText } from '../utils/fsx';
import { chunkText, Chunk } from './chunk';
import { logger } from '../utils/logger';

// In-memory storage for embeddings (in production, use a proper database)
let chunks: Chunk[] = [];
let embeddings: number[][] = [];

/**
 * Initialize RAG system with source text
 */
export async function initializeRAG(): Promise<void> {
  try {
    const sourceText = getSourceText();
    if (!sourceText) {
      logger.warn('No source text found for RAG initialization');
      return;
    }
    
    chunks = chunkText(sourceText);
    const { generateEmbeddings } = await import('./embed');
    embeddings = await generateEmbeddings(chunks);
    
    logger.info(`RAG system initialized with ${chunks.length} chunks`);
  } catch (error) {
    logger.error('Error initializing RAG system:', error);
    throw error;
  }
}

/**
 * Search for similar chunks using cosine similarity
 */
export async function searchSimilarChunks(query: string, language: 'en' | 'ar'): Promise<string> {
  try {
    if (chunks.length === 0) {
      await initializeRAG();
    }
    
    if (chunks.length === 0) {
      return language === 'ar' 
        ? 'عذراً، لا توجد معلومات متاحة حالياً.'
        : 'Sorry, no information is currently available.';
    }
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Calculate similarities
    const similarities = embeddings.map((embedding, index) => ({
      chunk: chunks[index],
      similarity: cosineSimilarity(queryEmbedding, embedding)
    }));
    
    // Sort by similarity and get top 3
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .filter(item => item.similarity > 0.7); // Only include relevant chunks
    
    if (topChunks.length === 0) {
      return language === 'ar'
        ? 'عذراً، لم أجد معلومات ذات صلة بسؤالك. يرجى المحاولة بصيغة أخرى.'
        : 'Sorry, I couldn\'t find relevant information for your question. Please try rephrasing.';
    }
    
    // Combine top chunks into response
    const response = topChunks
      .map(item => item.chunk?.text || '')
      .join('\n\n');
    
    return response;
  } catch (error) {
    logger.error('Error searching similar chunks:', error);
    throw error;
  }
}

/**
 * Get RAG system status
 */
export function getRAGStatus(): { chunks: number; embeddings: number } {
  return {
    chunks: chunks.length,
    embeddings: embeddings.length
  };
}
