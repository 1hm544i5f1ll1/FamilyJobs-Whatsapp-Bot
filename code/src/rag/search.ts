import { generateEmbedding } from './embed';
import { cosineSimilarity } from '../utils/cosine';
import { getSourceText } from '../utils/fsx';
import { chunkText, Chunk } from './chunk';
import { logger } from '../utils/logger';
import { generateNaturalResponse } from './generate';

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
    
    // Sort by similarity and get top chunks
    const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Log top similarity scores for debugging
    const top3Scores = sortedSimilarities.slice(0, 3).map(s => s.similarity.toFixed(3));
    logger.info(`Top 3 similarity scores: ${top3Scores.join(', ')}`);
    
    // Lower threshold for customer support - be more helpful
    const topChunks = sortedSimilarities
      .slice(0, 3)
      .filter(item => item.similarity > 0.5); // Lower threshold from 0.7 to 0.5
    
    // Get context chunks for GPT (use top 3 regardless of similarity for better context)
    const contextChunks = sortedSimilarities
      .slice(0, 3)
      .map(item => item.chunk)
      .filter((chunk): chunk is Chunk => chunk !== undefined);

    // Always use GPT to generate natural language response
    try {
      logger.info(`Generating natural language response with ${contextChunks.length} context chunks`);
      const naturalResponse = await generateNaturalResponse(query, contextChunks, language);
      return naturalResponse;
    } catch (error) {
      logger.error('Error generating natural response, falling back to chunks:', error);
      
      // Fallback to chunks if GPT fails
      if (topChunks.length > 0) {
        const response = topChunks
          .map(item => item.chunk?.text || '')
          .join('\n\n');
        return response;
      }
      
      // Final fallback
      const bestMatch = sortedSimilarities[0];
      if (bestMatch && bestMatch.chunk) {
        return bestMatch.chunk.text;
      }
      
      // Last resort fallback
      return language === 'ar'
        ? 'عذراً، حدث خطأ في معالجة سؤالك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.'
        : 'Sorry, there was an error processing your question. Please try again or contact us directly.';
    }
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
