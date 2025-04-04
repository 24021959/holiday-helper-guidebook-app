
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'it' | 'en' | 'fr' | 'es' | 'de';

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
      // Get the translation from our translation function
      const translated = await translateText(text, 'it', language);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
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

// Translation function using browser's fetch API
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  // Use a public translation API
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
