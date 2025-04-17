
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import FilteredIconNav from "@/components/FilteredIconNav";
import { useIsMobile } from "@/hooks/use-mobile";
import NavigateBack from "@/components/NavigateBack";

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Aggiornamento menu...");
    refreshHeaderSettings();
  };

  if (headerLoading) {
    return <LoadingView message="Caricamento menu..." fullScreen={true} />;
  }

  return (
    <div className={`flex flex-col h-screen ${isMobile ? 'w-full p-0 m-0 max-w-none' : ''}`}>
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <NavigateBack />
          <h2 className="text-lg font-medium text-gray-700">Menu</h2>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-auto">
        {headerError ? (
          <ErrorView 
            message={headerError || "Errore di caricamento"}
            onRefresh={handleRefresh}
            onAlternativeAction={() => window.location.reload()}
            alternativeActionText="Ricarica pagina"
          />
        ) : (
          <FilteredIconNav 
            parentPath={null} 
            onRefresh={handleRefresh} 
            refreshTrigger={refreshTrigger} 
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Menu;
