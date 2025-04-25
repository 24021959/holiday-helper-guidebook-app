
import { Language } from '@/types/translation.types';

// This is a simple fallback translation service when the main service fails
export const translateWithFallback = async (
  text: string, 
  fromLang: 'it' | string, 
  toLang: Language
): Promise<string> => {
  try {
    // Public translation API as fallback
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 1000))}&langpair=${fromLang}|${toLang}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Fallback translation failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('No translation in response');
  } catch (error) {
    console.error('Fallback translation error:', error);
    // Return original text if fallback fails
    return text;
  }
};
