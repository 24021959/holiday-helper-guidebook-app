
import React, { useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import ErrorDisplay from "@/components/home/ErrorDisplay";
import { LanguageFlags } from "@/components/LanguageFlags";
import FilteredIconNav from "@/components/FilteredIconNav";
import { useTranslation } from "@/context/TranslationContext";
import { useCurrentPath } from "@/hooks/useCurrentPath";

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();
  const { language } = useTranslation();
  const currentPath = useCurrentPath();

  useEffect(() => {
    console.log("[Home] Rendering Home page");
    console.log("[Home] Current path:", currentPath);
    console.log("[Home] Current language:", language);
  }, [currentPath, language]);

  if (loading) {
    return <LoadingView message="Caricamento..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshHeaderSettings} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-center mb-6">
          <LanguageFlags />
        </div>
        <FilteredIconNav parentPath={null} refreshTrigger={1} />
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
