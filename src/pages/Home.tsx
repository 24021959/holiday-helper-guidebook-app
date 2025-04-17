
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { useHomePageSaver } from '@/hooks/useHomePageSaver';
import LanguageFlags from '@/components/home/LanguageFlags';
import HeroImage from '@/components/home/HeroImage';
import ContentSection from '@/components/home/ContentSection';
import ErrorDisplay from '@/components/home/ErrorDisplay';
import { toast } from "sonner";

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();
  const [heroImage] = useState('/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png');
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { saveHomePageToDatabase, isSaving } = useHomePageSaver();
  
  // Automatically save the home page when the component mounts
  useEffect(() => {
    const initializeHomePage = async () => {
      try {
        // Ensure the home page is saved and translated in all languages
        console.log("Initializing home page and translations...");
        
        // Disable no-translation flag temporarily to ensure translations work
        const wasNoTranslation = document.body.hasAttribute('data-no-translation');
        if (wasNoTranslation) {
          document.body.removeAttribute('data-no-translation');
        }
        
        await saveHomePageToDatabase();
        toast.success("Pagine Home verificate e tradotte con successo");
        
        // Restore no-translation flag if it was present
        if (wasNoTranslation) {
          document.body.setAttribute('data-no-translation', 'true');
        }
      } catch (error) {
        console.error("Error initializing home page:", error);
        toast.error("Errore durante l'inizializzazione delle pagine Home");
      }
    };
    
    initializeHomePage();
  }, []);

  useEffect(() => {
    // Detect current route and set language accordingly
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const pathLang = pathSegments[0];
    
    if (pathLang && ['en', 'fr', 'es', 'de'].includes(pathLang)) {
      console.log(`Setting language to ${pathLang} based on URL path`);
      setLanguage(pathLang as 'it' | 'en' | 'fr' | 'es' | 'de');
    } else if (pathSegments.length === 0 || pathSegments[0] === 'home') {
      // Root or /home path defaults to Italian
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && savedLanguage !== 'it') {
        // Redirect to language-specific home page
        console.log(`Redirecting to saved language: ${savedLanguage}`);
        navigate(`/${savedLanguage}`);
      } else {
        console.log('Setting default language to Italian');
        setLanguage('it');
      }
    }
  }, [location.pathname, setLanguage, navigate]);

  useEffect(() => {
    const detectBrowserLanguage = () => {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        // Use previously saved language preference if available
        console.log(`Using saved language preference: ${savedLanguage}`);
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
        console.log(`Setting language to ${browserLang} based on browser language`);
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

  const handleSelectLanguage = (selectedLanguage: string) => {
    console.log(`Language selected by user: ${selectedLanguage}`);
    setLanguage(selectedLanguage as 'it' | 'en' | 'fr' | 'es' | 'de');
    localStorage.setItem('selectedLanguage', selectedLanguage);
    
    // Navigate to the correct language home page
    if (selectedLanguage === 'it') {
      navigate('/');
    } else {
      navigate(`/${selectedLanguage}`);
    }
  };

  const handleForceSaveTranslations = async () => {
    try {
      toast.info("Forzando il salvataggio delle traduzioni...");
      await saveHomePageToDatabase();
      toast.success("Traduzioni della Home page forzate con successo");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error forcing translations:", error);
      toast.error("Errore durante il salvataggio forzato delle traduzioni");
    }
  };

  if (loading || isSaving) {
    return <LoadingView message="Caricamento..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshHeaderSettings} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Language Flags at the top */}
      <LanguageFlags currentLanguage={language} onSelectLanguage={handleSelectLanguage} />
      
      {/* Header with settings from database */}
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      />
      
      {/* Hero Image - Responsive with appropriate aspect ratio */}
      <HeroImage imageUrl={heroImage} altText="La nostra struttura" />
      
      {/* Content Area */}
      <ContentSection onExploreMenu={handleGoToMenu} />
      
      {/* Debug button - only in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-amber-50 border-t border-amber-200 p-3">
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            <p className="text-amber-800 text-sm">Strumenti di debug:</p>
            <button 
              onClick={handleForceSaveTranslations}
              className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded text-sm"
            >
              Forza salvataggio traduzioni Home
            </button>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Home;
