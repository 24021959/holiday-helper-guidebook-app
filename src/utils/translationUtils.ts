
import { Language } from "@/types/translation.types";

export const validateLanguage = (lang: Language): boolean => {
  return ["en", "fr", "es", "de"].includes(lang);
};

export const formatTranslationError = (error: any, lang: string): string => {
  if (error?.message) {
    return `Errore durante la traduzione in ${lang.toUpperCase()}: ${error.message}`;
  }
  return `Si è verificato un errore imprevisto durante la traduzione in ${lang.toUpperCase()}`;
};

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

