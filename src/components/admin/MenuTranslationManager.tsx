import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2, Globe, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const languageNames = {
  en: "Inglese 🇬🇧",
  fr: "Francese 🇫🇷",
  es: "Spagnolo 🇪🇸",
  de: "Tedesco 🇩🇪",
};

type Language = 'en' | 'fr' | 'es' | 'de';

interface LanguageStats {
  totalPages: number;
  translatedPages: number;
}

interface TranslationProgress {
  total: number;
  completed: number;
  currentPage?: string;
}

const MenuTranslationManager: React.FC = () => {
  const { translateAndCloneMenu } = useTranslation();
  const [isTranslating, setIsTranslating] = useState<Record<Language, boolean>>({
    en: false,
    fr: false,
    es: false,
    de: false
  });
  const [translated, setTranslated] = useState<Record<Language, boolean>>({
    en: false,
    fr: false,
    es: false,
    de: false
  });
  const [stats, setStats] = useState<Record<Language, LanguageStats>>({
    en: { totalPages: 0, translatedPages: 0 },
    fr: { totalPages: 0, translatedPages: 0 },
    es: { totalPages: 0, translatedPages: 0 },
    de: { totalPages: 0, translatedPages: 0 }
  });
  const [translationProgress, setTranslationProgress] = useState<Record<Language, TranslationProgress>>({
    en: { total: 0, completed: 0 },
    fr: { total: 0, completed: 0 },
    es: { total: 0, completed: 0 },
    de: { total: 0, completed: 0 }
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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
      
      const newStats: Record<Language, LanguageStats> = {
        en: { totalPages: italianCount, translatedPages: 0 },
        fr: { totalPages: italianCount, translatedPages: 0 },
        es: { totalPages: italianCount, translatedPages: 0 },
        de: { totalPages: italianCount, translatedPages: 0 }
      };
      
      const newProgress: Record<Language, TranslationProgress> = {
        en: { total: italianCount, completed: 0 },
        fr: { total: italianCount, completed: 0 },
        es: { total: italianCount, completed: 0 },
        de: { total: italianCount, completed: 0 }
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
      if (language === 'it' as any) {
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

  const getProgressPercentage = (lang: Language): number => {
    if (isTranslating[lang]) {
      const { total, completed } = translationProgress[lang];
      if (total === 0) return 0;
      return Math.round((completed / total) * 100);
    }
    
    if (stats[lang].totalPages === 0) return 0;
    return Math.round((stats[lang].translatedPages / stats[lang].totalPages) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-700">Traduzione e Importazione Menu</CardTitle>
          <CardDescription>
            Traduci e importa tutte le pagine esistenti nei rispettivi menu in lingue diverse. 
            Questo processo tradurrà automaticamente tutte le pagine in italiano e le inserirà nel menu corrispondente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-amber-800 text-sm">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Questo processo tradurrà e clomerà <strong>tutte</strong> le pagine in italiano nei menu delle rispettive lingue</li>
                    <li>La procedura potrebbe richiedere diversi minuti a seconda del numero di pagine</li>
                    <li>Ogni lingua viene elaborata separatamente: esegui una traduzione alla volta</li>
                    <li>Le pagine già tradotte verranno aggiornate con l'ultima versione in italiano</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-700">Seleziona la lingua da tradurre:</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchStats}
                disabled={isLoadingStats}
                className="flex items-center"
              >
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Aggiorna statistiche
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['en', 'fr', 'es', 'de'] as Language[]).map(lang => (
                <Card key={lang} className={`border ${translated[lang] ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="text-lg font-medium">{languageNames[lang]}</span>
                      </div>
                      {translated[lang] && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Tradotto
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>
                          {isTranslating[lang] 
                            ? `${translationProgress[lang].completed}/${translationProgress[lang].total} pagine` 
                            : `${stats[lang].translatedPages}/${stats[lang].totalPages} pagine`}
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(lang)} 
                        className="h-2"
                      />
                      
                      {isTranslating[lang] && translationProgress[lang].currentPage && (
                        <div className="mt-1 text-xs text-gray-500 italic">
                          Traduzione: {translationProgress[lang].currentPage}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleTranslateMenu(lang)}
                        disabled={isTranslating[lang]}
                        className="w-full"
                        variant={translated[lang] ? "outline" : "default"}
                      >
                        {isTranslating[lang] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Traduzione in corso...
                          </>
                        ) : translated[lang] ? (
                          "Traduci di nuovo"
                        ) : (
                          `Traduci in ${languageNames[lang]}`
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuTranslationManager;
