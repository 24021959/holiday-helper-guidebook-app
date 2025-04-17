
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Language } from "@/types/translation.types";

interface TranslationCardProps {
  lang: Language;
  languageName: string;
  isTranslating: boolean;
  translated: boolean;
  stats: {
    totalPages: number;
    translatedPages: number;
  };
  progress: {
    total: number;
    completed: number;
    currentPage?: string;
  };
  onTranslate: () => void;
}

export const TranslationCard = ({
  lang,
  languageName,
  isTranslating,
  translated,
  stats,
  progress,
  onTranslate
}: TranslationCardProps) => {
  const getProgressPercentage = () => {
    if (isTranslating) {
      if (progress.total === 0) return 0;
      return Math.round((progress.completed / progress.total) * 100);
    }
    
    if (stats.totalPages === 0) return 0;
    return Math.round((stats.translatedPages / stats.totalPages) * 100);
  };

  return (
    <Card className={`border ${translated ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-lg font-medium">{languageName}</span>
          </div>
          {translated && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Check className="h-3 w-3 mr-1" /> Tradotto
            </Badge>
          )}
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>
              {isTranslating 
                ? `${progress.completed}/${progress.total} pagine` 
                : `${stats.translatedPages}/${stats.totalPages} pagine`}
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
          
          {isTranslating && progress.currentPage && (
            <div className="mt-1 text-xs text-gray-500 italic">
              Traduzione: {progress.currentPage}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Button 
            onClick={onTranslate}
            disabled={isTranslating}
            className="w-full"
            variant={translated ? "outline" : "default"}
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduzione in corso...
              </>
            ) : translated ? (
              "Traduci di nuovo"
            ) : (
              `Traduci in ${languageName}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
