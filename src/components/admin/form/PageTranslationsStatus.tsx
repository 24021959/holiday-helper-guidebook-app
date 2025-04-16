
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [translations, setTranslations] = useState<Record<string, boolean>>(availableTranslations);
  const normalizedPath = path.replace(/^\/[a-z]{2}/, '');
  
  useEffect(() => {
    const checkTranslations = async () => {
      if (currentLanguage === 'it') {
        // For Italian pages, check all other language versions
        const languages = Object.keys(supportedLanguages).filter(lang => lang !== 'it');
        
        try {
          const translationChecks = await Promise.all(
            languages.map(async (lang) => {
              const langPath = `/${lang}${normalizedPath}`;
              const { data } = await supabase
                .from('custom_pages')
                .select('id')
                .eq('path', langPath)
                .maybeSingle();
              return [lang, !!data];
            })
          );
          
          setTranslations(Object.fromEntries(translationChecks));
        } catch (error) {
          console.error('Error checking translations:', error);
        }
      } else {
        // For non-Italian pages, check if the Italian version exists
        try {
          const { data } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', normalizedPath)
            .maybeSingle();
          
          setTranslations({ it: !!data });
        } catch (error) {
          console.error('Error checking Italian version:', error);
        }
      }
    };
    
    checkTranslations();
  }, [path, normalizedPath, currentLanguage]);

  const handleViewTranslation = (lang: string) => {
    const langPath = lang === 'it' ? normalizedPath : `/${lang}${normalizedPath}`;
    window.open(`/preview${langPath}`, '_blank');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <Badge className="mb-2" variant="outline">
            {supportedLanguages[currentLanguage as keyof typeof supportedLanguages] || 'Versione Principale'}
          </Badge>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-gray-600">{path}</p>
        </div>
        
        {currentLanguage === 'it' && (
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
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <p className="text-sm text-gray-600 mr-2">
          {currentLanguage === 'it' ? 'Traduzioni disponibili:' : 'Versione in altre lingue:'}
        </p>
        {Object.entries(translations).map(([lang, exists]) => (
          lang !== currentLanguage && (
            <Badge 
              key={lang} 
              variant={exists ? 'default' : 'outline'} 
              className={exists 
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer' 
                : 'text-gray-600'
              }
              onClick={() => exists && handleViewTranslation(lang)}
            >
              {supportedLanguages[lang as keyof typeof supportedLanguages]}
            </Badge>
          )
        ))}
      </div>
    </div>
  );
};
