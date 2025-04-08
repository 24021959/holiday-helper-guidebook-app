
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import FilteredIconNav from "@/components/FilteredIconNav";
import TranslatedText from "@/components/TranslatedText";
import { useIsMobile } from "@/hooks/use-mobile";

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  
  const handleRefresh = () => {
    console.log("Menu - Manual refresh");
    setRefreshTrigger(prev => prev + 1);
    toast.info(<TranslatedText text="Refreshing menu..." />);
    refreshHeaderSettings();
  };
  
  if (headerLoading) {
    return <LoadingView message={<TranslatedText text="Loading menu..." />} fullScreen={true} />;
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
            message={headerError || <TranslatedText text="Loading error" />}
            onRefresh={handleRefresh}
            onAlternativeAction={() => window.location.reload()}
            alternativeActionText={<TranslatedText text="Reload page" />}
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
