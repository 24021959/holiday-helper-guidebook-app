
import React, { createContext, useContext, useState } from 'react';
import { TranslationContextType } from '@/types/translation.types';

// Contesto semplificato che non supporta più le traduzioni
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language] = useState<'it'>('it');

  // Funzioni stub per mantenere la compatibilità
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
    targetLangs: any[]
  ) => {
    return { it: { title: pageTitle, content: pageContent } };
  };

  const translateAndCloneMenu = async () => {
    console.log("Funzione non disponibile nella versione solo italiana");
  };

  const value = {
    language,
    setLanguage: () => {}, // Funzione vuota
    translate,
    translateBulk,
    translatePage,
    translateSequential,
    translateAndCloneMenu,
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
