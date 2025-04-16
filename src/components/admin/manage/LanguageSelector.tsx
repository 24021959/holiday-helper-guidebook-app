
import { Button } from "@/components/ui/button";

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (langCode: string) => void;
}

export const languages: Language[] = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex gap-2 mb-6">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLanguage === lang.code ? "default" : "outline"}
          onClick={() => onLanguageChange(lang.code)}
          className={currentLanguage === lang.code ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
        >
          <span className="mr-2">{lang.flag}</span>
          {lang.name}
        </Button>
      ))}
    </div>
  );
};
