
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Language = 'it' | 'en' | 'fr' | 'es' | 'de';

// Map delle lingue per l'API di OpenAI
const languageMap: Record<Language, string> = {
  it: 'Italian',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German'
};

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && ['it', 'en', 'fr', 'es', 'de'].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const translate = async (text: string): Promise<string> => {
    // If the language is Italian (default), return the original text
    if (language === 'it') return text;
    
    try {
      // Use our custom Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          text, 
          targetLang: languageMap[language]
        }
      });

      if (error) {
        console.error('Translation error from Edge Function:', error);
        
        // Try using the fallback translation service
        try {
          const fallbackTranslation = await translateWithFallback(text, 'it', language);
          return fallbackTranslation;
        } catch (fallbackError) {
          console.error('Fallback translation also failed:', fallbackError);
          return text; // Return original text as last resort
        }
      }
      
      if (data && data.translatedText) {
        return data.translatedText;
      } else {
        throw new Error('No translation returned');
      }
    } catch (error) {
      console.error('Translation error:', error);
      
      // Try using the fallback translation service
      try {
        const fallbackTranslation = await translateWithFallback(text, 'it', language);
        return fallbackTranslation;
      } catch (fallbackError) {
        console.error('Fallback translation also failed:', fallbackError);
        toast.error('Errore di traduzione', { 
          description: 'Impossibile tradurre il testo al momento.' 
        });
        return text; // Return original text on error
      }
    }
  };

  const value = { language, setLanguage, translate };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Fallback translation function using the free MyMemory API
async function translateWithFallback(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text; // Return original text if translation fails
  } catch (error) {
    console.error('Translation API error:', error);
    return text; // Return original text on error
  }
}
