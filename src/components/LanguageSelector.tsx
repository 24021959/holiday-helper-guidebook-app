
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate } from "react-router-dom";

type Language = {
  code: string;
  name: string;
  flag: string; // Emoji fallback
  flagSrc: string;
};

const languages: Language[] = [
  { code: "it", name: "Italiano", flag: "🇮🇹", flagSrc: "/lovable-uploads/5303c7bc-6aa0-4c3b-bbc2-1c94e0d01b97.png" },
  { code: "en", name: "English", flag: "🇬🇧", flagSrc: "/lovable-uploads/af6207d5-0a3c-4cad-84bc-b6c071c9d6f6.png" },
  { code: "fr", name: "Français", flag: "🇫🇷", flagSrc: "/lovable-uploads/075a9ac2-23e8-482c-beb3-45d28a3dcd94.png" },
  { code: "es", name: "Español", flag: "🇪🇸", flagSrc: "/lovable-uploads/5db5eda4-9c7f-4ef5-ae67-f9372ffda8e1.png" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", flagSrc: "/lovable-uploads/537376f3-5c3d-4d02-ba0d-37cb86165489.png" },
];

interface LanguageSelectorProps {
  onSelectLanguage?: (code: string) => void;
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setLanguage, language: currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});

  const toggleLanguageSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectLanguage = (code: string) => {
    // Update the language in our context
    setLanguage(code as 'it' | 'en' | 'fr' | 'es' | 'de');
    
    // Save to localStorage
    localStorage.setItem("selectedLanguage", code);
    
    // Call the original onSelectLanguage prop if provided
    if (onSelectLanguage) {
      onSelectLanguage(code);
    } else {
      // If no callback is provided, navigate to menu
      navigate("/menu");
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
              <div className="w-12 h-8 flex items-center justify-center overflow-hidden rounded shadow-sm">
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
              <span className="text-2xl font-medium text-gray-700">{language.name}</span>
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
