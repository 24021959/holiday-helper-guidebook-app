
import { supabase } from "@/integrations/supabase/client";
import { Language, languageMap } from "@/types/translation.types";
import { translateWithFallback } from "./fallbackTranslation";
import { toast } from "sonner";

export const translateText = async (
  text: string, 
  targetLang: Language, 
  cache: { getCached: (lang: string, text: string) => string | undefined }
): Promise<string> => {
  if (targetLang === 'it' || !text || text.trim() === '') return text;
  
  // Check cache first
  const cached = cache.getCached(targetLang, text);
  if (cached) return cached;
  
  try {
    console.log(`Translating to ${targetLang}: "${text.substring(0, 30)}..."`);
    
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { 
        text, 
        targetLang: languageMap[targetLang]
      }
    });

    if (error) {
      console.error("Translation error from edge function:", error);
      throw error;
    }
    
    if (data && data.translatedText) {
      console.log(`Translation successful: "${data.translatedText.substring(0, 30)}..."`);
      return data.translatedText;
    }
    
    throw new Error('No translation returned from edge function');
  } catch (error) {
    console.error('Translation error:', error);
    console.log('Using fallback translation service...');
    try {
      const fallbackResult = await translateWithFallback(text, 'it', targetLang);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('Fallback translation also failed:', fallbackError);
      // Return original text in case of complete failure
      return text;
    }
  }
};

export const translateBulkTexts = async (
  texts: string[], 
  targetLang: Language,
  cache: { getCached: (lang: string, text: string) => string | undefined }
): Promise<string[]> => {
  if (targetLang === 'it' || texts.length === 0) return texts;

  // Filter texts that need translation (not in cache)
  const textsToTranslate: string[] = [];
  const results: (string | null)[] = new Array(texts.length);
  const indexMapping: Record<number, number> = {}; // Maps original index to textsToTranslate index

  texts.forEach((text, index) => {
    if (!text || text.trim() === '') {
      results[index] = text;
      return;
    }
    
    const cached = cache.getCached(targetLang, text);
    if (cached) {
      results[index] = cached;
    } else {
      indexMapping[textsToTranslate.length] = index;
      textsToTranslate.push(text);
      results[index] = null;
    }
  });

  if (textsToTranslate.length === 0) {
    return results.map(r => r as string);
  }

  try {
    console.log(`Bulk translating ${textsToTranslate.length} texts to ${targetLang}`);
    
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { 
        bulkTranslation: textsToTranslate, 
        targetLang: languageMap[targetLang]
      }
    });

    if (error) {
      console.error("Bulk translation error from edge function:", error);
      throw error;
    }

    if (data?.translatedTexts && Array.isArray(data.translatedTexts)) {
      console.log(`Bulk translation successful, received ${data.translatedTexts.length} translations`);
      
      // Map translated texts back to their original positions
      textsToTranslate.forEach((_, index) => {
        const originalIndex = indexMapping[index];
        if (originalIndex !== undefined) {
          results[originalIndex] = data.translatedTexts[index] || texts[originalIndex];
        }
      });
      
      return results.map((result, index) => {
        return result !== null ? result : texts[index];
      });
    }
    
    throw new Error('Invalid translation response from edge function');
  } catch (error) {
    console.error('Bulk translation error:', error);
    console.log('Using individual fallback translations...');
    
    // Translate each text individually using fallback
    const promises = textsToTranslate.map(text => 
      translateWithFallback(text, 'it', targetLang)
        .catch(e => {
          console.error('Individual fallback translation failed:', e);
          return text; // Return original text if translation fails
        })
    );
    
    const translatedTexts = await Promise.all(promises);
    
    // Map translated texts back to their original positions
    translatedTexts.forEach((translatedText, index) => {
      const originalIndex = indexMapping[index];
      if (originalIndex !== undefined) {
        results[originalIndex] = translatedText;
      }
    });
    
    return results.map((result, index) => {
      return result !== null ? result : texts[index];
    });
  }
};
