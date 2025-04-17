
import { useState } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { toast } from "sonner";
import { usePageSaving } from "./usePageSaving";

/**
 * Hook per la gestione delle traduzioni delle pagine
 * IMPORTANTE: La traduzione avviene SOLO quando l'utente fa clic sul pulsante di traduzione manuale
 */
export const usePageTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { translateSequential } = useTranslation();
  const { saveNewPage } = usePageSaving();

  /**
   * Traduce e crea pagine in tutte le lingue supportate
   * Questa funzione deve essere chiamata SOLO quando l'utente fa clic sul pulsante di traduzione manuale
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
      toast.info("Avvio traduzione manuale in tutte le lingue...");

      // Forza la disattivazione del flag no-translation SOLO per questa operazione
      const wasNoTranslation = document.body.hasAttribute('data-no-translation');
      if (wasNoTranslation) {
        document.body.removeAttribute('data-no-translation');
      }

      // Traduci in tutte le altre lingue
      const targetLangs: ("en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      const translations = await translateSequential(
        content,
        title,
        targetLangs
      );
      
      // Gestione speciale per la Home page
      const isHomePage = finalPath === "/" || finalPath === "/home";
      
      for (const lang of targetLangs) {
        if (translations[lang]) {
          // Se è la home page, usa un formato di path speciale
          let translatedPath = isHomePage 
            ? `/${lang}` 
            : `/${lang}${finalPath}`;
            
          // Make sure we're not duplicating language prefixes
          translatedPath = translatedPath.replace(/\/[a-z]{2}\/[a-z]{2}\//, `/${lang}/`);
          
          let translatedParentPath = null;
          
          if (pageType === "submenu" && parentPath) {
            // Ensure parent path also has correct language prefix
            if (parentPath.startsWith('/')) {
              // Remove any existing language prefix
              const cleanParentPath = parentPath.replace(/^\/[a-z]{2}\//, '/');
              translatedParentPath = `/${lang}${cleanParentPath}`;
            } else {
              translatedParentPath = `/${lang}/${parentPath}`;
            }
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

      // Ripristina il flag no-translation dopo l'operazione
      if (wasNoTranslation) {
        document.body.setAttribute('data-no-translation', 'true');
      }

      return true;
    } catch (error) {
      console.error("Error translating pages:", error);
      toast.error("Errore durante la traduzione delle pagine");
      
      // Garantisci il ripristino del flag no-translation in caso di errore
      document.body.setAttribute('data-no-translation', 'true');
      
      throw error;
    } finally {
      setIsTranslating(false);
      
      // Controllo finale di sicurezza per garantire che il flag no-translation sia impostato
      document.body.setAttribute('data-no-translation', 'true');
    }
  };

  return {
    isTranslating,
    setIsTranslating,
    translatePages
  };
};
