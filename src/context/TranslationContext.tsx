
import React, { createContext, useContext } from 'react';
import { TranslationContextType } from '@/types/translation.types';
import { useTranslationProvider } from '@/hooks/translation/useTranslationProvider';
import { useSequentialTranslation } from '@/hooks/translation/useSequentialTranslation';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
  } = useTranslationProvider();

  const { translateSequential } = useSequentialTranslation(translatePage);

  // Add empty implementation for translateAndCloneMenu to satisfy the type
  const translateAndCloneMenu = async (targetLang: any, progressCallback?: any) => {
    console.log("translateAndCloneMenu not implemented yet");
  };

  const value = {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
    translateSequential,
    translateAndCloneMenu, // Add this to satisfy the type
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
