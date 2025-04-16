
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Language, TranslationContextType, languageMap } from '@/types/translation.types';
import { useTranslationCache } from '@/hooks/translation/useTranslationCache';
import { translateText, translateBulkTexts } from '@/services/translationService';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const translateSequential = async (
    pageContent: string,
    pageTitle: string,
    targetLangs: Language[]
  ): Promise<Record<Language, {title: string, content: string}>> => {
    const results: Record<Language, {title: string, content: string}> = {
      it: { title: pageTitle, content: pageContent },
      en: { title: "", content: "" },
      fr: { title: "", content: "" },
      es: { title: "", content: "" },
      de: { title: "", content: "" }
    };

    for (const lang of targetLangs) {
      if (lang !== 'it') {
        try {
          console.log(`Traduzione in corso per ${languageMap[lang]}...`);
          toast.info(`Traduzione in corso: ${languageMap[lang]}`);
          
          const { title, content } = await translatePage(pageContent, pageTitle);
          results[lang] = { title, content };
          
          toast.success(`Traduzione completata: ${languageMap[lang]}`);
        } catch (error) {
          console.error(`Error translating to ${lang}:`, error);
          toast.error(`Errore nella traduzione in ${languageMap[lang]}`);
          results[lang] = { title: pageTitle, content: pageContent };
        }
      }
    }
    
    return results;
  };

  const translateAndCloneMenu = async (
    targetLang: Language,
    progressCallback?: (completed: number, currentPage?: string) => void
  ): Promise<void> => {
    if (targetLang === 'it') {
      toast.error("Non è necessario tradurre il menu in italiano (lingua base)");
      return;
    }

    try {
      toast.info(`Iniziando la traduzione e duplicazione del menu in ${languageMap[targetLang]}...`);
      
      const { data: italianPages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .eq('published', true);

      if (pagesError) throw pagesError;

      if (!italianPages || italianPages.length === 0) {
        toast.error("Nessuna pagina italiana trovata da tradurre");
        return;
      }

      let processedCount = 0;
      for (const page of italianPages) {
        try {
          if (progressCallback) {
            progressCallback(processedCount, page.title);
          }

          const targetPath = `/${targetLang}${page.path}`;
          
          const { title, content } = await translatePage(page.content || '', page.title);
          
          const { data: existingPage } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', targetPath)
            .maybeSingle();

          const pageData = {
            title,
            content,
            path: targetPath,
            image_url: page.image_url,
            icon: page.icon,
            is_submenu: page.is_submenu,
            parent_path: page.parent_path ? `/${targetLang}${page.parent_path}` : null,
            published: page.published,
            list_type: page.list_type,
            list_items: page.list_items
          };

          if (existingPage) {
            await supabase
              .from('custom_pages')
              .update(pageData)
              .eq('id', existingPage.id);
          } else {
            await supabase
              .from('custom_pages')
              .insert(pageData);
          }

          processedCount++;
          if (progressCallback) {
            progressCallback(processedCount);
          }

        } catch (pageError) {
          console.error(`Errore nella traduzione della pagina "${page.title}":`, pageError);
          toast.error(`Errore nella traduzione della pagina: ${page.title}`);
        }
      }

      toast.success(`Traduzione e clonazione del menu in ${languageMap[targetLang]} completata!`);
    } catch (error) {
      console.error(`Errore nella traduzione del menu in ${targetLang}:`, error);
      toast.error(`Errore nella traduzione del menu in ${languageMap[targetLang]}`);
    }
  };

  const value = {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
    translateSequential,
    translateAndCloneMenu
  };

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
