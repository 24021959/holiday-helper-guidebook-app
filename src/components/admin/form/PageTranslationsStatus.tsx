
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageTranslationsStatusProps {
  currentLanguage: string;
  title: string;
  path: string;
  isTranslating: boolean;
  availableTranslations: Record<string, boolean>;
  onTranslate: () => void;
}

const supportedLanguages = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch'
};

export const PageTranslationsStatus = ({
  currentLanguage,
  title,
  path,
  isTranslating,
  availableTranslations,
  onTranslate
}: PageTranslationsStatusProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <Badge className="mb-2" variant="outline">
            {currentLanguage === 'it' ? 'Versione Italiana' : 
             supportedLanguages[currentLanguage as keyof typeof supportedLanguages] || 'Versione Principale'}
          </Badge>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-gray-600">{path}</p>
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          <span>{isTranslating ? "Traduzione in corso..." : "Traduci pagina"}</span>
        </Button>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <p className="text-sm text-gray-600 mr-2">Traduzioni disponibili:</p>
        {Object.entries(availableTranslations).map(([lang, exists]) => (
          lang !== currentLanguage && (
            <Badge 
              key={lang} 
              variant={exists ? 'default' : 'outline'} 
              className={exists ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'text-gray-600'}
            >
              {supportedLanguages[lang as keyof typeof supportedLanguages]}
            </Badge>
          )
        ))}
      </div>
    </div>
  );
};
