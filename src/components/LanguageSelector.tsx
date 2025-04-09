import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

type Language = {
  code: string;
  name: string;
  flag: string; // Emoji fallback
  flagSrc: string;
  nativeName: string; // Nome della lingua nella sua lingua nativa
};

const languages: Language[] = [
  { code: "it", name: "Italiano", nativeName: "Italiano", flag: "🇮🇹", flagSrc: "/lovable-uploads/5303c7bc-6aa0-4c3b-bbc2-1c94e0d01b97.png" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", flagSrc: "/lovable-uploads/5db5eda4-9c7f-4ef5-ae67-f9372ffda8e1.png" },
  { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷", flagSrc: "/lovable-uploads/075a9ac2-23e8-482c-beb3-45d28a3dcd94.png" },
  { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸", flagSrc: "/lovable-uploads/af6207d5-0a3c-4cad-84bc-b6c071c9d6f6.png" },
  { code: "de", name: "Deutsch", nativeName: "Deutsch", flag: "🇩🇪", flagSrc: "/lovable-uploads/537376f3-5c3d-4d02-ba0d-37cb86165489.png" },
];

interface LanguageSelectorProps {
  onSelectLanguage?: (code: string) => void;
  language?: string;
  onChange?: (lang: 'it' | 'en' | 'fr' | 'es' | 'de') => void;
}

export const LanguageSelector = ({ onSelectLanguage, language: propLanguage, onChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setLanguage, language: contextLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});

  const currentLanguage = propLanguage || contextLanguage;
  
  useEffect(() => {
    console.log("LanguageSelector - Current path:", location.pathname);
    console.log("LanguageSelector - Current language:", currentLanguage);
  }, [location.pathname, currentLanguage]);

  const toggleLanguageSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectLanguage = (code: string) => {
    console.log(`Selecting language: ${code} from current path: ${location.pathname}`);
    
    setLanguage(code as 'it' | 'en' | 'fr' | 'es' | 'de');
    localStorage.setItem("selectedLanguage", code);
    
    console.log(`Lingua selezionata: ${code}`);
    const langInfo = languages.find(lang => lang.code === code);
    toast.success(`Lingua cambiata in ${langInfo?.name}`);
    
    const path = location.pathname;
    const isOnIndexPage = path === "/" || path === "";
    const isOnMenuPage = path === "/menu" || /^\/[a-z]{2}\/menu$/.test(path);
    const isOnSubmenuPage = path.startsWith("/submenu/");
    
    if (onChange) {
      onChange(code as 'it' | 'en' | 'fr' | 'es' | 'de');
    } else if (onSelectLanguage) {
      onSelectLanguage(code);
    } else if (isOnIndexPage) {
      if (code === 'it') {
        navigate("/menu");
      } else {
        navigate(`/${code}/menu`);
      }
    } else if (isOnMenuPage) {
      if (code === 'it') {
        navigate("/menu");
      } else {
        navigate(`/${code}/menu`);
      }
    } else if (isOnSubmenuPage) {
      const pathParts = path.split('/').filter(Boolean);
      
      pathParts.shift();
      
      const hasLanguagePrefix = ['en', 'fr', 'es', 'de', 'it'].includes(pathParts[0]);
      
      if (hasLanguagePrefix && pathParts.length >= 2) {
        if (code === 'it') {
          navigate(`/submenu/${pathParts[1]}`);
        } else {
          navigate(`/submenu/${code}/${pathParts[1]}`);
        }
      } else if (!hasLanguagePrefix && pathParts.length >= 1) {
        if (code === 'it') {
          navigate(`/submenu/${pathParts[0]}`);
        } else {
          navigate(`/submenu/${code}/${pathParts[0]}`);
        }
      } else {
        if (code === 'it') {
          navigate("/menu");
        } else {
          navigate(`/${code}/menu`);
        }
      }
    } else {
      if (code === 'it') {
        navigate("/menu");
      } else {
        navigate(`/${code}/menu`);
      }
    }
    
    setIsOpen(false);
  };

  const handleImageError = (code: string) => {
    setImageFailed(prev => ({...prev, [code]: true}));
  };

  return (
    <div className="w-full flex flex-col justify-between h-full">
      {languages.map((language) => (
        <div 
          key={language.code}
          className="mb-4 transform transition-all duration-300 hover:scale-102 flex-1"
        >
          <Button
            variant={currentLanguage === language.code ? "default" : "outline"}
            className={`w-full h-full min-h-20 flex items-center justify-between py-8 px-6 
              ${currentLanguage === language.code 
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                : 'bg-white hover:bg-emerald-50 border-2 border-gray-100 hover:border-emerald-200'} 
              rounded-xl shadow-sm hover:shadow-md transition-all`}
            onClick={() => handleSelectLanguage(language.code)}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-10 flex items-center justify-center overflow-hidden rounded shadow-sm">
                {imageFailed[language.code] ? (
                  <span className="text-3xl">{language.flag}</span>
                ) : (
                  <img 
                    src={language.flagSrc} 
                    alt={language.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(language.code)}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-medium text-gray-700">{language.name}</span>
                <span className="text-sm text-gray-500">{language.nativeName}</span>
              </div>
            </div>
            <span className="text-emerald-500">
              {currentLanguage === language.code ? "✓" : "→"}
            </span>
          </Button>
        </div>
      ))}
    </div>
  );
};
