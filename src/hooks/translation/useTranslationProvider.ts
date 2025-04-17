
import React, { useState, useEffect } from 'react';
import { Language, TranslationContextType } from '@/types/translation.types';
import { useTranslationCache } from './useTranslationCache';
import { translateText, translateBulkTexts } from '@/services/translationService';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveHomePage, updateHomePage, saveMenuIcon, updateMenuIcon } from "@/utils/homePageUtils";

export const useTranslationProvider = () => {
  const [language, setLanguage] = useState<Language>('it');
  const { cache, getCached, setCached } = useTranslationCache();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && ['it', 'en', 'fr', 'es', 'de'].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const translate = async (text: string): Promise<string> => {
    const translated = await translateText(text, language, { getCached });
    setCached(language, text, translated);
    return translated;
  };

  const translateBulk = async (texts: string[]): Promise<string[]> => {
    return translateBulkTexts(texts, language, { getCached });
  };

  const translatePage = async (pageContent: string, pageTitle: string): Promise<{title: string, content: string}> => {
    if (language === 'it') {
      return { title: pageTitle, content: pageContent };
    }
    
    try {
      const translatedTitle = await translate(pageTitle);
      
      let translatedContent: string;
      if (pageContent.length > 8000) {
        const sections = pageContent.split(/\n\n+/).filter(s => s.trim() !== '');
        const translatedSections = await translateBulk(sections);
        translatedContent = translatedSections.join('\n\n');
      } else {
        translatedContent = await translate(pageContent);
      }
      
      return {
        title: translatedTitle,
        content: translatedContent
      };
    } catch (error) {
      console.error('Error translating page:', error);
      toast.error('Errore nella traduzione della pagina');
      return { title: pageTitle, content: pageContent };
    }
  };

  return {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
  };
};
