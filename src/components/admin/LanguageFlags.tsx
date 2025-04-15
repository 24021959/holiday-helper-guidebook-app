
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LanguageFlagsProps {
  path: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageFlags: React.FC<LanguageFlagsProps> = ({ path }) => {
  const [availableTranslations, setAvailableTranslations] = useState<Record<string, boolean>>({});
  const normalizedPath = path.replace(/^\/[a-z]{2}/, '');

  useEffect(() => {
    const checkTranslations = async () => {
      try {
        const translationChecks = await Promise.all(
          languages.map(async (lang) => {
            const langPath = `/${lang.code}${normalizedPath}`;
            const { data } = await supabase
              .from('custom_pages')
              .select('id')
              .eq('path', langPath)
              .maybeSingle();
            return [lang.code, !!data];
          })
        );

        setAvailableTranslations(Object.fromEntries(translationChecks));
      } catch (error) {
        console.error('Error checking translations:', error);
      }
    };

    checkTranslations();
  }, [path, normalizedPath]);

  const handleFlagClick = (langPath: string) => {
    window.open(`/preview${langPath}`, '_blank');
  };

  return (
    <div className="flex gap-2">
      {languages.map((lang) => {
        const langPath = `/${lang.code}${normalizedPath}`;
        const isAvailable = availableTranslations[lang.code];

        return (
          <TooltipProvider key={lang.code}>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant={isAvailable ? "default" : "outline"}
                  className={`cursor-pointer ${
                    isAvailable 
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                      : "text-gray-400"
                  }`}
                  onClick={() => isAvailable && handleFlagClick(langPath)}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {isAvailable 
                  ? `Visualizza versione in ${lang.name}` 
                  : `Traduzione in ${lang.name} non disponibile`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};
