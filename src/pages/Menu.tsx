
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import IconNav from "@/components/IconNav";

interface IconData {
  id: string;
  path: string;
  label: string;
  icon: string;
  parent_path: string | null;
  title?: string;
  is_parent?: boolean;
}

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootPages, setRootPages] = useState<IconData[]>([]);
  
  // Carica tutte le pagine principali (senza parent_path)
  useEffect(() => {
    const loadRootPages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Menu - Caricamento pagine principali");
        
        const { data: pages, error: pagesError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path')
          .is('parent_path', null);
          
        if (pagesError) {
          console.error("Errore nel caricamento delle pagine:", pagesError);
          throw pagesError;
        }
        
        if (!pages || pages.length === 0) {
          console.log("Nessuna pagina principale trovata");
          setRootPages([]);
        } else {
          console.log(`Trovate ${pages.length} pagine principali`);
          
          // Converti le pagine in icone per il menu
          const iconData = pages.map(page => ({
            id: page.id,
            path: page.path,
            label: page.title,
            icon: page.icon || 'FileText',
            parent_path: page.parent_path,
            is_parent: true // Considera tutte le pagine principali come potenziali genitori
          }));
          
          setRootPages(iconData);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle pagine principali:", error);
        setError("Errore nel caricamento del menu. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRootPages();
  }, [refreshTrigger]);
  
  const handleRefresh = () => {
    console.log("Menu - Aggiornamento manuale");
    setRefreshTrigger(prev => prev + 1);
    toast.info("Aggiornamento menu in corso...");
    refreshHeaderSettings();
  };
  
  if (headerLoading || isLoading) {
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
        {error || headerError ? (
          <ErrorView 
            message={error || headerError || "Errore di caricamento"}
            onRefresh={handleRefresh}
            onAlternativeAction={() => window.location.reload()}
            alternativeActionText="Ricarica pagina"
          />
        ) : (
          <IconNav 
            icons={rootPages} 
            parentPath={null} 
            onRefresh={handleRefresh} 
          />
        )}
      </div>
      
      {/* Footer con logo */}
      <Footer />
    </div>
  );
};

export default Menu;
