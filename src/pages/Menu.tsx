
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import FilteredIconNav from "@/components/FilteredIconNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/context/TranslationContext";
import { useLocation } from "react-router-dom";

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  const { language, setLanguage } = useTranslation();
  const location = useLocation();
  
  // Controlla se siamo in un menu specifico per lingua
  useEffect(() => {
    const path = location.pathname;
    console.log("Menu - Current path:", path);
    
    // Estrai la lingua dal percorso, ad esempio /en/menu => en
    const languageMatch = path.match(/^\/([a-z]{2})\/menu/);
    if (languageMatch && languageMatch[1]) {
      const detectedLanguage = languageMatch[1];
      console.log("Menu - Detected language from URL:", detectedLanguage);
      
      // Aggiorna la lingua solo se è valida e diversa da quella attuale
      if (['it', 'en', 'fr', 'es', 'de'].includes(detectedLanguage) && detectedLanguage !== language) {
        console.log("Menu - Setting language from URL:", detectedLanguage);
        setLanguage(detectedLanguage as 'it' | 'en' | 'fr' | 'es' | 'de');
      }
    }
  }, [location.pathname, language, setLanguage]);
  
  const handleRefresh = () => {
    console.log("Menu - Manual refresh");
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing menu...");
    refreshHeaderSettings();
  };
  
  if (headerLoading) {
    return <LoadingView message="Loading menu..." fullScreen={true} />;
  }

  return (
    <div className={`flex flex-col h-screen ${isMobile ? 'w-full p-0 m-0 max-w-none' : ''}`}>
      {/* Header with custom settings but NO admin button */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      {/* Main container with icons that takes all available space */}
      <div className="flex-1 flex flex-col overflow-auto">
        {headerError ? (
          <ErrorView 
            message={headerError || "Loading error"}
            onRefresh={handleRefresh}
            onAlternativeAction={() => window.location.reload()}
            alternativeActionText="Reload page"
          />
        ) : (
          <FilteredIconNav 
            parentPath={null} 
            onRefresh={handleRefresh} 
            refreshTrigger={refreshTrigger} 
          />
        )}
      </div>
      
      {/* Footer with logo */}
      <Footer />
    </div>
  );
};

export default Menu;
