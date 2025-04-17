
import { useState } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { toast } from "sonner";
import { usePageSaving } from "./usePageSaving";
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";

/**
 * Hook per la gestione delle traduzioni delle pagine
 */
export const usePageTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { translatePage: translatePageContent } = useTranslation();
  const { saveNewPage } = usePageSaving();

  /**
   * Traduce una pagina in una lingua specifica
   */
  const translatePage = async (
    content: string,
    title: string,
    finalPath: string,
    imageUrl: string | null,
    icon: string,
    pageType: string,
    parentPath: string | null,
    pageImages: any[],
    targetLang: Language
  ) => {
    try {
      setIsTranslating(true);
      toast.info(`Avvio traduzione in ${targetLang.toUpperCase()}...`);

      // Forza la disattivazione del flag no-translation SOLO per questa operazione
      const noTranslationFlag = document.body.hasAttribute('data-no-translation');
      if (noTranslationFlag) {
        document.body.removeAttribute('data-no-translation');
      }
      
      console.log(`Translating content: "${content.substring(0, 50)}..." and title: "${title}" to ${targetLang}`);
      
      const { title: translatedTitle, content: translatedContent } = await translatePageContent(content, title);
      
      console.log(`Translated title: "${translatedTitle}"`);
      console.log(`Translated content (preview): "${translatedContent.substring(0, 50)}..."`);
      
      // Gestione speciale per la Home page
      const isHomePage = finalPath === "/" || finalPath === "/home";
      
      // Crea il percorso per la pagina tradotta
      let translatedPath = isHomePage 
        ? `/${targetLang}` 
        : `/${targetLang}${finalPath}`;
        
      // Make sure we're not duplicating language prefixes
      translatedPath = translatedPath.replace(/\/[a-z]{2}\/[a-z]{2}\//, `/${targetLang}/`);
      
      let translatedParentPath = null;
      
      if (pageType === "submenu" && parentPath) {
        // Ensure parent path also has correct language prefix
        if (parentPath.startsWith('/')) {
          // Remove any existing language prefix
          const cleanParentPath = parentPath.replace(/^\/[a-z]{2}\//, '/');
          translatedParentPath = `/${targetLang}${cleanParentPath}`;
        } else {
          translatedParentPath = `/${targetLang}/${parentPath}`;
        }
      }
      
      console.log(`Creating translated page: ${targetLang}, path: ${translatedPath}, parentPath: ${translatedParentPath || 'none'}`);
      
      // Check if translation already exists
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', translatedPath)
        .maybeSingle();
        
      if (existingPage) {
        console.log(`Updating existing translation for ${targetLang}`);
      } else {
        console.log(`Creating new translation for ${targetLang}`);
      }
      
      await saveNewPage(
        translatedTitle,
        translatedContent,
        translatedPath,
        imageUrl,
        icon,
        pageType as any,
        translatedParentPath,
        pageImages
      );
      
      toast.success(`Pagina tradotta in ${targetLang.toUpperCase()} e salvata con successo`);

      // Ripristina il flag no-translation dopo l'operazione
      if (noTranslationFlag) {
        document.body.setAttribute('data-no-translation', 'true');
      }

      return true;
    } catch (error) {
      console.error("Error translating page:", error);
      toast.error("Errore durante la traduzione della pagina");
      
      // Garantisci il ripristino del flag no-translation in caso di errore
      const noTranslationFlag = document.body.hasAttribute('data-no-translation');
      if (noTranslationFlag) {
        document.body.setAttribute('data-no-translation', 'true');
      }
      
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  /**
   * Traduce una pagina in tutte le lingue in sequenza
   */
  const translatePageToAllLanguages = async (
    content: string,
    title: string,
    finalPath: string,
    imageUrl: string | null,
    icon: string,
    pageType: string,
    parentPath: string | null,
    pageImages: any[],
    targetLanguages: Language[]
  ) => {
    try {
      setIsTranslating(true);
      const totalLanguages = targetLanguages.length;
      
      for (let i = 0; i < totalLanguages; i++) {
        const lang = targetLanguages[i];
        toast.info(`Avvio traduzione in ${lang.toUpperCase()} (${i+1}/${totalLanguages})...`);
        
        try {
          await translatePage(
            content, 
            title, 
            finalPath, 
            imageUrl, 
            icon, 
            pageType, 
            parentPath, 
            pageImages, 
            lang
          );
          
          // Aggiungiamo una breve pausa tra le traduzioni
          if (i < totalLanguages - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (langError) {
          console.error(`Error translating to ${lang}:`, langError);
          toast.error(`Errore durante la traduzione in ${lang.toUpperCase()}`);
          // Continue with next language despite errors
        }
      }
      
      toast.success("Traduzioni completate con successo!");
      return true;
    } catch (error) {
      console.error("Error in translation sequence:", error);
      toast.error("Errore durante la sequenza di traduzioni");
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    isTranslating,
    setIsTranslating,
    translatePage,
    translatePageToAllLanguages
  };
};
