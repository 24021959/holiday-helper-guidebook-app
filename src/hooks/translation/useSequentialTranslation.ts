
import { Language } from '@/types/translation.types';
import { languageMap } from '@/types/translation.types';
import { toast } from "sonner";

export const useSequentialTranslation = (translatePage: (content: string, title: string) => Promise<{title: string, content: string}>) => {
  const translateSequential = async (
    pageContent: string,
    pageTitle: string,
    targetLangs: Language[]
  ): Promise<Record<Language, {title: string, content: string}>> => {
    const results: Record<Language, {title: string, content: string}> = {
      it: { title: pageTitle, content: pageContent },
      en: { title: "", content: "" },
      fr: { title: "", content: "" },
      es: { title: "", content: "" },
      de: { title: "", content: "" }
    };

    for (const lang of targetLangs) {
      if (lang !== 'it') {
        try {
          console.log(`Traduzione in corso per ${languageMap[lang]}...`);
          toast.info(`Traduzione in corso: ${languageMap[lang]}`);
          
          const { title, content } = await translatePage(pageContent, pageTitle);
          results[lang] = { title, content };
          
          toast.success(`Traduzione completata: ${languageMap[lang]}`);
          
          // Add a delay between translations
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error translating to ${lang}:`, error);
          toast.error(`Errore nella traduzione in ${languageMap[lang]}`);
          results[lang] = { title: pageTitle, content: pageContent };
        }
      }
    }
    
    return results;
  };

  return {
    translateSequential
  };
};
