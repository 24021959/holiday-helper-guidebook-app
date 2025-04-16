
import { useRef } from 'react';
import { TranslationCache } from '@/types/translation.types';

export const useTranslationCache = () => {
  const translationCacheRef = useRef<TranslationCache>({
    en: {},
    fr: {},
    es: {},
    de: {},
    it: {}
  });

  return {
    cache: translationCacheRef.current,
    getCached: (lang: string, text: string) => translationCacheRef.current[lang]?.[text],
    setCached: (lang: string, text: string, translation: string) => {
      if (!translationCacheRef.current[lang]) {
        translationCacheRef.current[lang] = {};
      }
      translationCacheRef.current[lang][text] = translation;
    }
  };
};
