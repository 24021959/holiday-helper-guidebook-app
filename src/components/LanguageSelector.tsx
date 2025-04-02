
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

  const toggleLanguageSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectLanguage = (code: string) => {
    onSelectLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      {languages.map((language) => (
        <div 
          key={language.code}
          className="mb-4 transform transition-all duration-300 hover:scale-105"
        >
          <Button
            variant="outline"
            className="w-full flex items-center justify-between py-6 px-6 bg-white bg-opacity-90 border-2 hover:bg-opacity-100"
            onClick={() => handleSelectLanguage(language.code)}
          >
            <div className="text-xl font-medium text-left">
              {language.name}
            </div>
            <span className="text-3xl">{language.flag}</span>
          </Button>
        </div>
      ))}
    </div>
  );
};
