
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageStats, TranslationProgress } from "@/hooks/menu/types";
import { Language } from "@/types/translation.types";
import { Check, Loader2, Languages } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TranslationCardProps {
  lang: Language;
  languageName: string;
  isTranslating: boolean;
  translated: boolean;
  stats: LanguageStats;
  progress?: TranslationProgress;
  onTranslate: () => void;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  lang,
  languageName,
  isTranslating,
  translated,
  stats,
  progress,
  onTranslate
}) => {
  const percentCompleted = stats.totalPages > 0 
    ? Math.round((stats.translatedPages / stats.totalPages) * 100)
    : 0;
  
  // Active progress percentage during translation
  const activeProgress = progress?.total ? 
    Math.round((progress.completed / progress.total) * 100) : 
    percentCompleted;
  
  return (
    <Card className={translated ? "border-green-200" : "border-gray-200"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {languageName}
          {translated && !isTranslating && (
            <Check className="ml-2 h-4 w-4 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Pagine tradotte:</span>
            <span className="font-medium">
              {stats.translatedPages} / {stats.totalPages}
            </span>
          </div>
          
          <Progress 
            value={isTranslating ? activeProgress : percentCompleted}
            className={isTranslating ? "animate-pulse" : ""}
          />
          
          {isTranslating && progress?.currentPage && (
            <div className="text-xs text-gray-500 italic mt-1">
              In corso: {progress.currentPage}
            </div>
          )}
          
          <Button
            className="w-full mt-4"
            onClick={onTranslate}
            variant={translated ? "outline" : "default"}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduzione in corso...
              </>
            ) : translated ? (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Aggiorna traduzione
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Traduci in {lang.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
