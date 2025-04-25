
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FlagItemProps = {
  code: string;
  currentLanguage: string;
  onClick: () => void;
};

const FlagItem = ({ code, currentLanguage, onClick }: FlagItemProps) => {
  const flagMap: Record<string, { src: string, alt: string, emoji: string }> = {
    it: { 
      src: "/lovable-uploads/5303c7bc-6aa0-4c3b-bbc2-1c94e0d01b97.png", 
      alt: "Italiano", 
      emoji: "🇮🇹" 
    },
    en: { 
      src: "/lovable-uploads/5db5eda4-9c7f-4ef5-ae67-f9372ffda8e1.png", 
      alt: "English", 
      emoji: "🇬🇧" 
    },
    fr: { 
      src: "/lovable-uploads/075a9ac2-23e8-482c-beb3-45d28a3dcd94.png", 
      alt: "Français", 
      emoji: "🇫🇷" 
    },
    es: { 
      src: "/lovable-uploads/af6207d5-0a3c-4cad-84bc-b6c071c9d6f6.png", 
      alt: "Español", 
      emoji: "🇪🇸" 
    },
    de: { 
      src: "/lovable-uploads/537376f3-5c3d-4d02-ba0d-37cb86165489.png", 
      alt: "Deutsch", 
      emoji: "🇩🇪" 
    }
  };
  
  return (
    <Button
      variant={currentLanguage === code ? "default" : "outline"}
      onClick={onClick}
      className={`w-full flex items-center justify-center ${
        currentLanguage === code 
          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300' 
          : 'hover:bg-emerald-50'
      }`}
    >
      <span className="text-2xl">{flagMap[code].emoji}</span>
    </Button>
  );
};

export const LanguageFlags: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (code: string) => {
    setLanguage(code as 'it' | 'en' | 'fr' | 'es' | 'de');
    toast.success(`Lingua cambiata in ${code.toUpperCase()}`);
    
    if (code === 'it') {
      navigate('/menu');
    } else {
      navigate(`/${code}/menu`);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      <FlagItem code="it" currentLanguage={language} onClick={() => handleLanguageChange('it')} />
      <FlagItem code="en" currentLanguage={language} onClick={() => handleLanguageChange('en')} />
      <FlagItem code="fr" currentLanguage={language} onClick={() => handleLanguageChange('fr')} />
      <FlagItem code="es" currentLanguage={language} onClick={() => handleLanguageChange('es')} />
      <FlagItem code="de" currentLanguage={language} onClick={() => handleLanguageChange('de')} />
    </div>
  );
};

export default LanguageFlags;
