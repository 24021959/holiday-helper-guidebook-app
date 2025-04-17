
import { AlertTriangle, Languages, HelpCircle } from "lucide-react";
import { languages } from "./LanguageSelector";
import { Button } from "@/components/ui/button";

interface LanguageInfoBannerProps {
  currentLanguage: string;
}

export const LanguageInfoBanner = ({ currentLanguage }: LanguageInfoBannerProps) => {
  const getLanguageLabel = (langCode: string): string => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? `${lang.flag} ${lang.name}` : langCode;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {currentLanguage === 'it' ? (
            <Languages className="h-5 w-5 text-blue-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            {currentLanguage === 'it' 
              ? "Stai visualizzando le pagine in italiano (lingua principale)" 
              : `Stai visualizzando le pagine in ${getLanguageLabel(currentLanguage)}`
            }
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            {currentLanguage === 'it' 
              ? (
                <>
                  <p>Le pagine in italiano sono le pagine principali da cui vengono generate le traduzioni.</p>
                  <p className="mt-1">Usa il pulsante "Traduci" sulle pagine in italiano per generare o aggiornare le traduzioni.</p>
                </>
              )
              : "Le pagine in questa lingua sono traduzioni. Eliminando una pagina italiana verranno eliminate anche tutte le sue traduzioni."
            }
          </div>
        </div>
      </div>
    </div>
  );
};
