
import { Language } from "@/types/translation.types";

export const validateLanguage = (lang: Language): boolean => {
  // Ora accettiamo solo italiano
  return lang === "it";
};

export const formatTranslationError = (error: any, lang: string): string => {
  if (error?.message) {
    return `Errore: ${error.message}`;
  }
  return `Si è verificato un errore imprevisto`;
};

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));
