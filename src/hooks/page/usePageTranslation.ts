
import { useState } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { toast } from "sonner";
import { usePageSaving } from "./usePageSaving";

/**
 * Hook for handling page translations
 */
export const usePageTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { translateSequential } = useTranslation();
  const { saveNewPage } = usePageSaving();

  /**
   * Translates and creates pages in all supported languages
   */
  const translatePages = async (
    content: string,
    title: string,
    finalPath: string,
    imageUrl: string | null,
    icon: string,
    pageType: string,
    parentPath: string | null,
    pageImages: any[]
  ) => {
    try {
      setIsTranslating(true);
      toast.info("Avvio traduzione automatica in tutte le lingue...");

      // Translate to all other languages
      const targetLangs: ("en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      const translations = await translateSequential(
        content,
        title,
        targetLangs
      );
      
      for (const lang of targetLangs) {
        if (translations[lang]) {
          const translatedPath = `/${lang}${finalPath}`;
          let translatedParentPath = null;
          
          if (pageType === "submenu" && parentPath) {
            translatedParentPath = `/${lang}${parentPath.replace(/^\/[a-z]{2}\//, '/')}`;
          }
          
          console.log(`Creating translated page: ${lang}, path: ${translatedPath}, parentPath: ${translatedParentPath || 'none'}`);
          
          await saveNewPage(
            translations[lang].title,
            translations[lang].content,
            translatedPath,
            imageUrl,
            icon,
            pageType as any,
            translatedParentPath,
            pageImages
          );
          
          toast.success(`Pagina tradotta in ${lang.toUpperCase()} e salvata con successo`);
        }
      }

      return true;
    } catch (error) {
      console.error("Error translating pages:", error);
      toast.error("Errore durante la traduzione delle pagine");
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    isTranslating,
    setIsTranslating,
    translatePages
  };
};
