
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate } from 'react-router-dom';
import { useHomePageSaver } from '@/hooks/useHomePageSaver';
import LanguageFlags from '@/components/home/LanguageFlags';
import HeroImage from '@/components/home/HeroImage';
import ContentSection from '@/components/home/ContentSection';
import ErrorDisplay from '@/components/home/ErrorDisplay';

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();
  const [heroImage] = useState('/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png');
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

  const handleSelectLanguage = (selectedLanguage: string) => {
    setLanguage(selectedLanguage as 'it' | 'en' | 'fr' | 'es' | 'de');
  };

  if (loading) {
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
      
      <Footer />
    </div>
  );
};

export default Home;
