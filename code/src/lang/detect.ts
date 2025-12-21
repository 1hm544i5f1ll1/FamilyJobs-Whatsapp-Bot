import * as francModule from 'franc-min';

// Handle different import styles for franc-min
const franc = (francModule as any).default || francModule;

/**
 * Detect if text is Arabic or English
 * Returns 'ar' for Arabic, 'en' for English
 */
export function detectLanguage(text: string): 'en' | 'ar' {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }

  // Check for Arabic characters (Unicode range: 0600-06FF, 0750-077F, 08A0-08FF, FB50-FDFF, FE70-FEFF)
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  if (arabicRegex.test(text)) {
    return 'ar';
  }

  // Use franc-min for other languages, but default to English if uncertain
  try {
    if (typeof franc === 'function') {
      const detected = franc(text);
      
      // If franc detects Arabic, return Arabic
      if (detected === 'arb') {
        return 'ar';
      }
    }
  } catch (error) {
    // If franc fails, default to English
    return 'en';
  }

  // Default to English for all other cases
  return 'en';
}
