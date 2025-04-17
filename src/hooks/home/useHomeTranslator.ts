
import { useTranslation } from "@/context/TranslationContext";
import { Language } from "@/types/translation.types";
import { supabase } from "@/integrations/supabase/client";
import { saveHomePage, updateHomePage, saveMenuIcon, updateMenuIcon } from "@/utils/homePageUtils";

export const useHomeTranslator = () => {
  const { translateSequential } = useTranslation();

  const translateAndSaveHome = async (
    originalTitle: string,
    originalContent: string,
    imageUrl: string,
    targetLangs: Language[]
  ) => {
    // Temporarily remove no-translation flag
    const wasNoTranslation = document.body.hasAttribute('data-no-translation');
    if (wasNoTranslation) {
      document.body.removeAttribute('data-no-translation');
    }

    try {
      const translations = await translateSequential(
        originalContent,
        originalTitle,
        targetLangs
      );

      for (const lang of targetLangs) {
        if (!translations[lang]) continue;

        const langPath = `/${lang}`;
        const translation = translations[lang];

        // Check if translation exists
        const { data: existingTranslation } = await supabase
          .from('custom_pages')
          .select('id')
          .eq('path', langPath)
          .maybeSingle();

        if (existingTranslation) {
          await updateHomePage({
            title: translation.title,
            content: translation.content,
            path: langPath,
            imageUrl
          });

          // Update menu icon
          await updateMenuIcon(langPath, translation.title);
        } else {
          // Create new translation
          await saveHomePage({
            id: crypto.randomUUID(),
            title: translation.title,
            content: translation.content,
            path: langPath,
            imageUrl
          });

          // Create menu icon
          await saveMenuIcon(langPath, translation.title);
        }
      }
    } finally {
      // Restore the no-translation flag
      if (wasNoTranslation) {
        document.body.setAttribute('data-no-translation', 'true');
      }
    }
  };

  return {
    translateAndSaveHome
  };
};

