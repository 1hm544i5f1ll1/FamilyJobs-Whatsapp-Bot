import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { Chunk } from './chunk';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

/**
 * Generate natural language response using GPT with RAG context
 */
export async function generateNaturalResponse(
  query: string,
  contextChunks: Chunk[],
  language: 'en' | 'ar'
): Promise<string> {
  if (!process.env['OPENAI_API_KEY']) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  try {
    // Build context from chunks
    const context = contextChunks
      .map(chunk => chunk.text)
      .join('\n\n')
      .trim();

    // Determine user type from query (simple heuristic)
    const userType = detectUserType(query, language);

    // Create system prompt based on language and user type
    const systemPrompt = language === 'ar'
      ? `أنت مساعد ذكي ومفيد في عائلة الوظائف مصر - فرع أسيوط. أنت متخصص في:
- مساعدة الآباء في البحث عن فرص عمل لأبنائهم
- مساعدة الطلاب في التوجيه المهني والاستشارات
- مساعدة العملاء في خدمات التوظيف والبحث عن وظائف

أجب بطريقة طبيعية ومحادثة، بلغة واضحة ومفيدة. استخدم المعلومات المتاحة للإجابة على الأسئلة. إذا لم تجد معلومات كافية، كن مفيداً وقدم نصائح عامة.`
      : `You are a helpful and intelligent assistant at Family Jobs Egypt - Assiut Branch. You specialize in:
- Helping parents find job opportunities for their children
- Assisting students with career guidance and counseling
- Supporting clients with employment services and job search

Respond naturally and conversationally, using clear and helpful language. Use the available information to answer questions. If you don't have enough information, be helpful and provide general guidance.`;

    // Create user message with context
    const userMessage = context
      ? `Context information:\n${context}\n\nQuestion: ${query}\n\nPlease provide a natural, conversational answer based on the context.`
      : `Question: ${query}\n\nPlease provide a helpful, natural response.`;

    logger.info(`Generating GPT response for ${userType} (${language})`);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedText = response.choices[0]?.message?.content?.trim() || '';
    
    if (!generatedText) {
      throw new Error('Empty response from GPT');
    }

    logger.info(`Generated response (${generatedText.length} chars)`);
    return generatedText;
  } catch (error) {
    logger.error('Error generating natural response:', error);
    throw error;
  }
}

/**
 * Detect user type from query (simple heuristic)
 */
function detectUserType(query: string, language: 'en' | 'ar'): 'parent' | 'student' | 'client' | 'unknown' {
  const lowerQuery = query.toLowerCase();
  
  // Parent indicators
  const parentKeywords = language === 'ar' 
    ? ['ابني', 'ابنتي', 'ولدي', 'بنتي', 'طفلي', 'أولادي', 'أبنائي']
    : ['my son', 'my daughter', 'my child', 'my children', 'kid', 'kids'];
  
  // Student indicators
  const studentKeywords = language === 'ar'
    ? ['طالب', 'طالبة', 'دراسة', 'جامعة', 'كلية', 'تخرج', 'شهادة']
    : ['student', 'study', 'university', 'college', 'graduate', 'degree', 'diploma'];
  
  // Client/Job seeker indicators
  const clientKeywords = language === 'ar'
    ? ['وظيفة', 'عمل', 'توظيف', 'شغل', 'راتب', 'مقابلة']
    : ['job', 'work', 'employment', 'career', 'salary', 'interview', 'resume', 'cv'];
  
  if (parentKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'parent';
  }
  
  if (studentKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'student';
  }
  
  if (clientKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'client';
  }
  
  return 'unknown';
}

