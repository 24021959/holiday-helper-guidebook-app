
import React, { createContext, useState, useContext } from 'react';
import { Language } from '@/types/translation.types';

type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
  translateBulk: (texts: string[]) => Promise<string[]>;
  translatePage: (pageContent: string, pageTitle: string) => Promise<{ title: string; content: string; }>;
  translateSequential: (pageContent: string, pageTitle: string, targetLangs: Language[]) => Promise<Record<Language, { title: string; content: string; }>>;
  translateAndCloneMenu: (targetLang: Language, progressCallback?: (completed: number, currentPage?: string) => void) => Promise<void>;
  t: (text: string) => string;
};

const defaultContext: TranslationContextType = {
  language: 'it',
  setLanguage: () => {},
  translate: async (text: string) => text,
  translateBulk: async (texts: string[]) => texts,
  translatePage: async (content: string, title: string) => ({ title, content }),
  translateSequential: async (content: string, title: string) => ({ 
    it: { title, content },
    en: { title, content },
    fr: { title, content },
    es: { title, content },
    de: { title, content }
  }),
  translateAndCloneMenu: async () => {},
  t: (text: string) => text,
};

export const TranslationContext = createContext<TranslationContextType>(defaultContext);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');

  const translate = async (text: string): Promise<string> => {
    return text;
  };

  const translateBulk = async (texts: string[]): Promise<string[]> => {
    return texts;
  };

  const translatePage = async (pageContent: string, pageTitle: string) => {
    return {
      title: pageTitle,
      content: pageContent
    };
  };

  const translateSequential = async (
    pageContent: string, 
    pageTitle: string, 
    targetLangs: Language[]
  ) => {
    return { it: { title: pageTitle, content: pageContent } };
  };

  const translateAndCloneMenu = async (
    targetLang: Language, 
    progressCallback?: (completed: number, currentPage?: string) => void
  ) => {
    console.log("Funzione non disponibile nella versione solo italiana");
  };

  const t = (text: string): string => {
    return text;
  };

  const value = {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
    translateSequential,
    translateAndCloneMenu,
    t
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
