
import { useState } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { toast } from "sonner";
import { usePageSaving } from "./usePageSaving";
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";
import { validateLanguage, formatTranslationError, delay } from "@/utils/translationUtils";

export const usePageTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { translatePage: translatePageContent } = useTranslation();
  const { saveNewPage } = usePageSaving();

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
  ): Promise<boolean> => {
    if (!validateLanguage(targetLang)) {
      toast.error(`Lingua non supportata: ${targetLang}`);
      return false;
    }

    try {
      setIsTranslating(true);
      console.log(`Inizio traduzione in ${targetLang.toUpperCase()}`);

      const noTranslationFlag = document.body.hasAttribute('data-no-translation');
      if (noTranslationFlag) {
        document.body.removeAttribute('data-no-translation');
      }

      const { title: translatedTitle, content: translatedContent } = 
        await translatePageContent(content, title);

      if (!translatedTitle || !translatedContent) {
        throw new Error("Contenuto tradotto non valido");
      }

      console.log(`Titolo tradotto: "${translatedTitle}"`);
      console.log(`Contenuto tradotto (anteprima): "${translatedContent.substring(0, 50)}..."`);

      const isHomePage = finalPath === "/" || finalPath === "/home";
      let translatedPath = isHomePage 
        ? `/${targetLang}` 
        : `/${targetLang}${finalPath}`;

      translatedPath = translatedPath
        .replace(/\/[a-z]{2}\/[a-z]{2}\//, `/${targetLang}/`)
        .replace(/^\/[a-z]{2}\//, `/${targetLang}/`);

      let translatedParentPath = null;
      if (pageType === "submenu" && parentPath) {
        const cleanParentPath = parentPath.replace(/^\/[a-z]{2}\//, '/');
        translatedParentPath = `/${targetLang}${cleanParentPath}`;
      }

      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', translatedPath)
        .maybeSingle();

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

      if (noTranslationFlag) {
        document.body.setAttribute('data-no-translation', 'true');
      }

      return true;
    } catch (error) {
      console.error("Errore durante la traduzione:", error);
      toast.error(formatTranslationError(error, targetLang));
      return false;
    } finally {
      setIsTranslating(false);
    }
  };

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
  ): Promise<boolean> => {
    try {
      setIsTranslating(true);
      const totalLanguages = targetLanguages.length;
      let successCount = 0;

      for (let i = 0; i < totalLanguages; i++) {
        const lang = targetLanguages[i];
        if (!validateLanguage(lang)) {
          console.warn(`Lingua non supportata: ${lang}, la salto`);
          continue;
        }

        toast.info(`Traduzione in corso: ${lang.toUpperCase()} (${i + 1}/${totalLanguages})`);
        
        try {
          const success = await translatePage(
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

          if (success) {
            successCount++;
            toast.success(`Traduzione in ${lang.toUpperCase()} completata`);
          }

          // Aggiungo una pausa tra le traduzioni per evitare sovraccarichi
          if (i < totalLanguages - 1) {
            await delay(2000);
          }
        } catch (langError) {
          console.error(`Errore durante la traduzione in ${lang}:`, langError);
          toast.error(`Errore durante la traduzione in ${lang.toUpperCase()}`);
        }
      }

      if (successCount === 0) {
        toast.error("Nessuna traduzione completata con successo");
        return false;
      }

      toast.success(`Traduzioni completate: ${successCount}/${totalLanguages}`);
      return true;
    } catch (error) {
      console.error("Errore durante la sequenza di traduzioni:", error);
      toast.error("Errore durante la sequenza di traduzioni");
      return false;
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
