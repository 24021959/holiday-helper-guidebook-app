
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilteredIconNav from "@/components/FilteredIconNav";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleRefresh = () => {
    console.log("Menu - Aggiornamento manuale");
    setRefreshTrigger(prev => prev + 1);
    toast.info("Aggiornamento menu in corso...");
    refreshHeaderSettings();
  };
  
  if (headerLoading) {
    return <LoadingView message="Caricamento menu..." fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header con impostazioni personalizzate */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      />
      
      {/* Contenitore principale con icone che occupa tutto lo spazio disponibile */}
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
      
      {/* Footer con logo */}
      <Footer />
    </div>
  );
};

export default Menu;
