
export type Language = 'it' | 'en' | 'fr' | 'es' | 'de';

export const languageMap: Record<Language, string> = {
  it: 'Italian',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German'
};

export interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  translateBulk: (texts: string[]) => Promise<string[]>;
  translatePage: (pageContent: string, pageTitle: string) => Promise<{title: string, content: string}>;
  translateSequential: (pageContent: string, pageTitle: string, targetLangs: Language[]) => Promise<Record<Language, {title: string, content: string}>>;
  translateAndCloneMenu: (targetLang: Language, progressCallback?: (completed: number, currentPage?: string) => void) => Promise<void>;
}

export interface TranslationCache {
  [key: string]: Record<string, string>;
}
