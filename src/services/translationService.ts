
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
    return translateWithFallback(text, 'it', targetLang);
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

  texts.forEach((text, index) => {
    const cached = cache.getCached(targetLang, text);
    if (cached) {
      results[index] = cached;
    } else {
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
      let translatedIndex = 0;
      
      console.log(`Bulk translation successful, received ${data.translatedTexts.length} translations`);
      
      return texts.map((text, index) => {
        if (results[index] !== null) {
          return results[index] as string;
        }
        return data.translatedTexts[translatedIndex++] || text;
      });
    }
    
    throw new Error('Invalid translation response from edge function');
  } catch (error) {
    console.error('Bulk translation error:', error);
    console.log('Using individual fallback translations...');
    
    // Translate each text individually using fallback
    const translatedTexts = await Promise.all(
      textsToTranslate.map(text => translateWithFallback(text, 'it', targetLang))
    );
    
    let translatedIndex = 0;
    return texts.map((text, index) => {
      if (results[index] !== null) {
        return results[index] as string;
      }
      return translatedTexts[translatedIndex++] || text;
    });
  }
};
