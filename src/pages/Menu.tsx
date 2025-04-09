
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
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  const { language, setLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  
  // Check if we're in a specific language menu
  useEffect(() => {
    const path = location.pathname;
    console.log("Menu - Current path:", path);
    
    // Extract language from path, e.g., /en/menu => en
    const languageMatch = path.match(/^\/([a-z]{2})\/menu/);
    if (languageMatch && languageMatch[1]) {
      const detectedLanguage = languageMatch[1];
      console.log("Menu - Detected language from URL:", detectedLanguage);
      
      // Update language only if valid and different from current
      if (['it', 'en', 'fr', 'es', 'de'].includes(detectedLanguage) && detectedLanguage !== language) {
        console.log("Menu - Setting language from URL:", detectedLanguage);
        setLanguage(detectedLanguage as 'it' | 'en' | 'fr' | 'es' | 'de');
      }
    } else if (path === '/menu' && language !== 'it') {
      // When on the Italian menu but language context is something else, sync it
      console.log("Menu - On Italian menu, syncing language to 'it'");
      setLanguage('it');
    }
  }, [location.pathname, language, setLanguage]);
  
  // Handle language change
  const handleLanguageChange = (newLanguage: 'it' | 'en' | 'fr' | 'es' | 'de') => {
    if (newLanguage === language) return;
    
    console.log(`Menu - Changing language from ${language} to ${newLanguage}`);
    setLanguage(newLanguage);
    
    // Navigate to the correct language version of the menu
    if (newLanguage === 'it') {
      navigate('/menu');
    } else {
      navigate(`/${newLanguage}/menu`);
    }
    
    // Refresh menu icons for the new language
    setRefreshTrigger(prev => prev + 1);
  };
  
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
      
      {/* Language selector (simplified) */}
      <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-700">Menu</h2>
          <div className="flex items-center space-x-2">
            {(['it', 'en', 'fr', 'es', 'de'] as const).map(lang => {
              const langInfo = { 
                it: { name: "IT", flagSrc: "/lovable-uploads/5303c7bc-6aa0-4c3b-bbc2-1c94e0d01b97.png" },
                en: { name: "EN", flagSrc: "/lovable-uploads/5db5eda4-9c7f-4ef5-ae67-f9372ffda8e1.png" },
                fr: { name: "FR", flagSrc: "/lovable-uploads/075a9ac2-23e8-482c-beb3-45d28a3dcd94.png" },
                es: { name: "ES", flagSrc: "/lovable-uploads/af6207d5-0a3c-4cad-84bc-b6c071c9d6f6.png" },
                de: { name: "DE", flagSrc: "/lovable-uploads/537376f3-5c3d-4d02-ba0d-37cb86165489.png" }
              }[lang];
              
              return (
                <button 
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex items-center rounded-md px-2 py-1 ${
                    lang === language 
                      ? 'bg-emerald-100 border border-emerald-300' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <img 
                    src={langInfo.flagSrc} 
                    alt={langInfo.name}
                    className="w-6 h-4 mr-1 object-cover"
                  />
                  <span className={`text-xs font-medium ${
                    lang === language ? 'text-emerald-800' : 'text-gray-600'
                  }`}>{langInfo.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
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
