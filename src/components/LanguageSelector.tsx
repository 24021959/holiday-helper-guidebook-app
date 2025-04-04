
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/TranslationContext";

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

interface LanguageSelectorProps {
  onSelectLanguage: (code: string) => void;
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setLanguage } = useTranslation();

  const toggleLanguageSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectLanguage = (code: string) => {
    // Update the language in our context
    setLanguage(code as 'it' | 'en' | 'fr' | 'es' | 'de');
    // Call the original onSelectLanguage prop
    onSelectLanguage(code);
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
            variant="outline"
            className="w-full h-full min-h-20 flex items-center justify-between py-8 px-6 bg-white hover:bg-emerald-50 border-2 border-gray-100 hover:border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-all"
            onClick={() => handleSelectLanguage(language.code)}
          >
            <div className="text-2xl font-medium text-left text-gray-700">
              {language.name}
            </div>
            <div className="flex items-center">
              <span className="text-4xl mr-2">{language.flag}</span>
              <span className="text-emerald-500 opacity-0 group-hover:opacity-100">
                →
              </span>
            </div>
          </Button>
        </div>
      ))}
    </div>
  );
};
