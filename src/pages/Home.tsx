import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import { useTranslation } from "@/context/TranslationContext";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '@/components/LanguageSelector';
import TranslatedText from '@/components/TranslatedText';
import { useHomePageSaver } from '@/hooks/useHomePageSaver';

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();
  const [heroImage, setHeroImage] = useState('/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png');
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const { saveHomePageToDatabase } = useHomePageSaver();
  
  // Automatically save the home page when the component mounts
  useEffect(() => {
    saveHomePageToDatabase();
  }, []);

  useEffect(() => {
    const detectBrowserLanguage = () => {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        // Use previously saved language preference if available
        setLanguage(savedLanguage as 'it' | 'en' | 'fr' | 'es' | 'de');
        return;
      }
      
      // Detect browser language
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      console.log("Detected browser language:", browserLang);
      
      // Map to our supported languages
      const supportedLanguages: Record<string, 'it' | 'en' | 'fr' | 'es' | 'de'> = {
        it: 'it',
        en: 'en',
        fr: 'fr',
        es: 'es',
        de: 'de'
      };
      
      if (supportedLanguages[browserLang]) {
        setLanguage(supportedLanguages[browserLang]);
      }
    };
    
    detectBrowserLanguage();
  }, [setLanguage]);

  const handleGoToMenu = () => {
    if (language === 'it') {
      navigate('/menu');
    } else {
      navigate(`/${language}/menu`);
    }
  };

  if (loading) {
    return <LoadingView message="Caricamento..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-md">
          <h2 className="font-bold mb-2">Errore:</h2>
          <p>{error}</p>
          <button 
            onClick={refreshHeaderSettings}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Language Flags at the top */}
      <div className="w-full bg-gray-50 p-2 flex justify-center">
        <div className="max-w-xl w-full grid grid-cols-5 gap-2">
          <FlagItem code="it" currentLanguage={language} onClick={() => setLanguage('it')} />
          <FlagItem code="en" currentLanguage={language} onClick={() => setLanguage('en')} />
          <FlagItem code="fr" currentLanguage={language} onClick={() => setLanguage('fr')} />
          <FlagItem code="es" currentLanguage={language} onClick={() => setLanguage('es')} />
          <FlagItem code="de" currentLanguage={language} onClick={() => setLanguage('de')} />
        </div>
      </div>
      
      {/* Header with settings from database */}
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      />
      
      {/* Hero Image - Responsive with appropriate aspect ratio */}
      <div className="w-full relative">
        <div className="container mx-auto px-4">
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg my-4">
            <img 
              src={heroImage} 
              alt="Hero" 
              className="w-full h-full object-contain bg-gray-50"
              onError={() => setHeroImage('/placeholder.svg')}
            />
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-emerald-800">
            <TranslatedText text="Benvenuti alla Locanda dell'Angelo" />
          </h1>
          
          <div className="prose prose-emerald mb-8">
            <p className="text-lg">
              <TranslatedText text="Esplora il nostro menu digitale e scopri tutte le informazioni sul nostro hotel, i nostri servizi e la nostra posizione." />
            </p>
            <p>
              <TranslatedText text="La nostra struttura offre comfort moderni in un ambiente tradizionale italiano. Siamo felici di darvi il benvenuto e rendere il vostro soggiorno il più piacevole possibile." />
            </p>
          </div>
          
          {/* Menu Button */}
          <div className="flex justify-center mt-8 mb-12">
            <Button 
              onClick={handleGoToMenu} 
              className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
            >
              <TranslatedText text="Esplora il nostro Menu" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Flag item component for language selection
const FlagItem = ({ code, currentLanguage, onClick }: { code: string, currentLanguage: string, onClick: () => void }) => {
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

export default Home;
