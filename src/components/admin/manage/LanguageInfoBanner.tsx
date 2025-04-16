
import { AlertTriangle } from "lucide-react";
import { languages } from "./LanguageSelector";

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
          <AlertTriangle className="h-5 w-5 text-blue-500" />
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
              ? "Quando elimini una pagina in italiano, verranno eliminate anche tutte le sue traduzioni."
              : "Le pagine in questa lingua sono traduzioni. Eliminando una pagina italiana verranno eliminate anche tutte le sue traduzioni."
            }
          </div>
        </div>
      </div>
    </div>
  );
};
