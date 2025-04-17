
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Language } from "@/types/translation.types";
import { TranslationCard } from "./manage/translation/TranslationCard";
import { WarningBanner } from "./manage/translation/WarningBanner";
import { useTranslationManager, languageNames } from "./manage/translation/useTranslationManager";

const MenuTranslationManager: React.FC = () => {
  const {
    isLoadingStats,
    isTranslating,
    translated,
    stats,
    translationProgress,
    fetchStats,
    handleTranslateMenu
  } = useTranslationManager();

  if (isLoadingStats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

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
            <WarningBanner />

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
                <TranslationCard
                  key={lang}
                  lang={lang}
                  languageName={languageNames[lang]}
                  isTranslating={isTranslating[lang]}
                  translated={translated[lang]}
                  stats={stats[lang]}
                  progress={translationProgress[lang]}
                  onTranslate={() => handleTranslateMenu(lang)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuTranslationManager;
