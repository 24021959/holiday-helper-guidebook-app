
import { Language } from "@/types/translation.types";

export const validateLanguage = (lang: Language): boolean => {
  const supportedLanguages = ['it', 'en', 'fr', 'es', 'de'];
  return supportedLanguages.includes(lang);
};

export const formatTranslationError = (error: any, lang: Language): string => {
  const languageNames: Record<Language, string> = {
    it: 'italiano',
    en: 'inglese',
    fr: 'francese',
    es: 'spagnolo',
    de: 'tedesco'
  };

  const langName = languageNames[lang] || lang.toUpperCase();
  
  if (error?.message) {
    return `Errore traduzione in ${langName}: ${error.message}`;
  } else if (typeof error === 'string') {
    return `Errore traduzione in ${langName}: ${error}`;
  } else {
    return `Errore durante la traduzione in ${langName}`;
  }
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getLanguageFromPath = (path: string): Language | null => {
  const match = path.match(/^\/([a-z]{2})\//);
  if (match && ['en', 'fr', 'es', 'de', 'it'].includes(match[1])) {
    return match[1] as Language;
  }
  return null;
};

export const stripLanguageFromPath = (path: string): string => {
  return path.replace(/^\/[a-z]{2}\//, '/');
};

export const addLanguageToPath = (path: string, lang: Language): string => {
  if (lang === 'it') {
    return stripLanguageFromPath(path);
  }
  
  const cleanPath = stripLanguageFromPath(path);
  return `/${lang}${cleanPath}`;
};
