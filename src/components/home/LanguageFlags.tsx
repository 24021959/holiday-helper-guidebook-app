
import React, { useState } from 'react';

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
  
  const [imageFailed, setImageFailed] = useState(false);
  
  return (
    <button 
      onClick={onClick}
      className={`h-12 w-full flex items-center justify-center rounded-md overflow-hidden border-2 transition-all ${
        code === currentLanguage 
          ? 'border-emerald-500 bg-emerald-50' 
          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
      }`}
      title={flagMap[code].alt}
    >
      {imageFailed ? (
        <span className="text-2xl">{flagMap[code].emoji}</span>
      ) : (
        <img 
          src={flagMap[code].src} 
          alt={flagMap[code].alt}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </button>
  );
};

type LanguageFlagsProps = {
  currentLanguage: string;
  onSelectLanguage: (language: string) => void;
};

const LanguageFlags: React.FC<LanguageFlagsProps> = ({ currentLanguage, onSelectLanguage }) => {
  return (
    <div className="w-full bg-gray-50 p-2 flex justify-center">
      <div className="max-w-xl w-full grid grid-cols-5 gap-2">
        <FlagItem code="it" currentLanguage={currentLanguage} onClick={() => onSelectLanguage('it')} />
        <FlagItem code="en" currentLanguage={currentLanguage} onClick={() => onSelectLanguage('en')} />
        <FlagItem code="fr" currentLanguage={currentLanguage} onClick={() => onSelectLanguage('fr')} />
        <FlagItem code="es" currentLanguage={currentLanguage} onClick={() => onSelectLanguage('es')} />
        <FlagItem code="de" currentLanguage={currentLanguage} onClick={() => onSelectLanguage('de')} />
      </div>
    </div>
  );
};

export default LanguageFlags;
