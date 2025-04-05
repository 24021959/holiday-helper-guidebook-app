
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate } from "react-router-dom";

type Language = {
  code: string;
  name: string;
  flagSrc: string;
};

const languages: Language[] = [
  { code: "it", name: "Italiano", flagSrc: "/flags/italy.png" },
  { code: "en", name: "English", flagSrc: "/flags/uk.png" },
  { code: "fr", name: "Français", flagSrc: "/flags/france.png" },
  { code: "es", name: "Español", flagSrc: "/flags/spain.png" },
  { code: "de", name: "Deutsch", flagSrc: "/flags/germany.png" },
];

interface LanguageSelectorProps {
  onSelectLanguage?: (code: string) => void;
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setLanguage, language: currentLanguage } = useTranslation();
  const navigate = useNavigate();

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
            <div className="flex items-center gap-3">
              <img 
                src={language.flagSrc} 
                alt={`${language.name} flag`} 
                className="w-10 h-auto object-contain rounded"
              />
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
