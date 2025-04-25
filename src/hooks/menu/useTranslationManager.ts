import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import { Language } from "@/types/translation.types";
import { LanguageStats, TranslationProgress } from "@/hooks/menu/types";
import { delay } from "@/utils/translationUtils";

export const useTranslationManager = () => {
  // Fix: add 'it' property to all Language records
  const [isTranslating, setIsTranslating] = useState<Record<Language, boolean>>({
    en: false,
    fr: false,
    es: false,
    de: false,
    it: false
  });
  const [translated, setTranslated] = useState<Record<Language, boolean>>({
    en: false,
    fr: false,
    es: false,
    de: false,
    it: false
  });
  const [stats, setStats] = useState<Record<Language, LanguageStats>>({
    en: { totalPages: 0, translatedPages: 0 },
    fr: { totalPages: 0, translatedPages: 0 },
    es: { totalPages: 0, translatedPages: 0 },
    de: { totalPages: 0, translatedPages: 0 },
    it: { totalPages: 0, translatedPages: 0 }
  });
  const [translationProgress, setTranslationProgress] = useState<Record<Language, TranslationProgress>>({
    en: { total: 0, completed: 0 },
    fr: { total: 0, completed: 0 },
    es: { total: 0, completed: 0 },
    de: { total: 0, completed: 0 },
    it: { total: 0, completed: 0 }
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      
      const { data: italianPages, error: italianError } = await supabase
        .from('custom_pages')
        .select('id', { count: 'exact' })
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .eq('published', true);
        
      if (italianError) {
        console.error("Error loading Italian pages:", italianError);
        return;
      }
      
      const italianCount = italianPages?.length || 0;
      
      // Fix: include 'it' in all records
      const newStats: Record<Language, LanguageStats> = {
        en: { totalPages: italianCount, translatedPages: 0 },
        fr: { totalPages: italianCount, translatedPages: 0 },
        es: { totalPages: italianCount, translatedPages: 0 },
        de: { totalPages: italianCount, translatedPages: 0 },
        it: { totalPages: italianCount, translatedPages: italianCount }
      };
      
      // Fix: include 'it' in all records
      const newProgress: Record<Language, TranslationProgress> = {
        en: { total: italianCount, completed: 0 },
        fr: { total: italianCount, completed: 0 },
        es: { total: italianCount, completed: 0 },
        de: { total: italianCount, completed: italianCount },
        it: { total: italianCount, completed: italianCount }
      };
      
      for (const lang of ['en', 'fr', 'es', 'de'] as Language[]) {
        const { data: langPages, error: langError } = await supabase
          .from('custom_pages')
          .select('id', { count: 'exact' })
          .like('path', `/${lang}/%`)
          .eq('published', true);
          
        if (!langError) {
          const translatedCount = langPages?.length || 0;
          newStats[lang].translatedPages = translatedCount;
          newProgress[lang].completed = translatedCount;
          
          if (langPages && langPages.length > 0) {
            setTranslated(prev => ({ ...prev, [lang]: true }));
          }
        }
      }
      
      setStats(newStats);
      setTranslationProgress(newProgress);
    } catch (error) {
      console.error("Error fetching translation stats:", error);
      toast.error("Errore nel caricamento delle statistiche");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleTranslateMenu = async (language: Language) => {
    try {
      if (language === 'it') {
        toast.error("Non è necessario tradurre il menu in italiano (lingua base)");
        return;
      }
      
      setIsTranslating(prev => ({ ...prev, [language]: true }));
      toast.info(`Avvio traduzione del menu in ${languageNames[language]}`);
      
      // Fetch Italian pages to translate
      const { data: italianPages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .eq('published', true);

      if (pagesError) {
        throw pagesError;
      }

      if (!italianPages || italianPages.length === 0) {
        toast.error("Nessuna pagina italiana trovata da tradurre");
        return;
      }
      
      setTranslationProgress(prev => ({
        ...prev,
        [language]: {
          total: italianPages.length,
          completed: 0,
          currentPage: ''
        }
      }));

      // Process each page
      for (let i = 0; i < italianPages.length; i++) {
        const page = italianPages[i];
        const translatedPath = `/${language}${page.path.replace(/^\/[a-z]{2}\//, '/')}`;
        
        try {
          // Update progress
          setTranslationProgress(prev => ({
            ...prev,
            [language]: {
              ...prev[language],
              completed: i,
              currentPage: page.title
            }
          }));

          // Check if translation already exists
          const { data: existingTranslation } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', translatedPath)
            .maybeSingle();

          if (existingTranslation) {
            console.log(`Translation already exists for ${page.title} in ${language}`);
            continue;
          }

          const { translatePage } = useTranslation();
          const { title, content } = await translatePage(page.content, page.title);
          
          // Save translated page
          const { error: saveError } = await supabase
            .from('custom_pages')
            .insert({
              ...page,
              id: undefined,
              title,
              content,
              path: translatedPath,
              parent_path: page.parent_path ? `/${language}${page.parent_path}` : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (saveError) {
            console.error(`Error saving translation for ${page.title}:`, saveError);
            toast.error(`Errore nel salvare la traduzione di ${page.title}`);
          } else {
            console.log(`Successfully translated and saved ${page.title} to ${language}`);
          }

          // Add delay between translations
          await delay(1000);
        } catch (error) {
          console.error(`Error translating ${page.title}:`, error);
          toast.error(`Errore nella traduzione di ${page.title}`);
        }
      }

      setTranslated(prev => ({ ...prev, [language]: true }));
      toast.success(`Menu tradotto in ${languageNames[language]} con successo!`);
      
      await fetchStats();
    } catch (error) {
      console.error(`Errore nella traduzione del menu in ${language}:`, error);
      toast.error(`Errore nella traduzione del menu in ${languageNames[language]}`);
    } finally {
      setIsTranslating(prev => ({ ...prev, [language]: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    isLoadingStats,
    isTranslating,
    translated,
    stats,
    translationProgress,
    fetchStats,
    handleTranslateMenu
  };
};

const languageNames: Record<Language, string> = {
  en: "Inglese 🇬🇧",
  fr: "Francese 🇫🇷",
  es: "Spagnolo 🇪🇸",
  de: "Tedesco 🇩🇪",
  it: "Italiano 🇮🇹"
};

export { languageNames };
