
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
    <div className="w-full max-w-md mx-auto">
      {languages.map((language) => (
        <div 
          key={language.code}
          className="mb-4 transform transition-all duration-300 hover:scale-102"
        >
          <Button
            variant="outline"
            className="w-full flex items-center justify-between py-6 px-6 bg-white hover:bg-emerald-50 border-2 border-gray-100 hover:border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-all"
            onClick={() => handleSelectLanguage(language.code)}
          >
            <div className="text-xl font-medium text-left text-gray-700">
              {language.name}
            </div>
            <div className="flex items-center">
              <span className="text-3xl mr-2">{language.flag}</span>
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
