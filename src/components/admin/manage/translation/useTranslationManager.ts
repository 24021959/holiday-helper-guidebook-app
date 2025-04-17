
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import { Language } from "@/types/translation.types";
import { LanguageStats, TranslationProgress } from "@/hooks/menu/types";

export const useTranslationManager = () => {
  const { translateAndCloneMenu } = useTranslation();
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
        de: { total: italianCount, completed: 0 },
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
      
      const { data: italianPages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('title')
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
      
      const updateProgress = (completedPages: number, currentPage?: string) => {
        setTranslationProgress(prev => ({
          ...prev,
          [language]: {
            ...prev[language],
            completed: completedPages,
            currentPage
          }
        }));
      };
      
      await translateAndCloneMenu(language, updateProgress);
      
      setTranslated(prev => ({ ...prev, [language]: true }));
      toast.success(`Menu tradotto in ${languageNames[language]} con successo!`);
      
      fetchStats();
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
