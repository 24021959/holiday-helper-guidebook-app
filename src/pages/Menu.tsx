
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FilteredIconNav from "@/components/FilteredIconNav";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Funzione semplificata per sincronizzare le pagine con le icone del menu
  const syncPagesWithMenu = async () => {
    try {
      console.log("Menu - Sincronizzazione pagine con menu...");
      
      // 1. Carica tutte le pagine pubblicate
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path')
        .eq('published', true);
        
      if (pagesError) {
        console.error("Errore nel caricamento delle pagine:", pagesError);
        return;
      }
      
      if (!pages || pages.length === 0) {
        console.log("Nessuna pagina pubblicata da sincronizzare");
        return;
      }
      
      console.log(`Trovate ${pages.length} pagine pubblicate`);
      
      // 2. Carica tutte le icone menu
      const { data: menuIcons, error: menuError } = await supabase
        .from('menu_icons')
        .select('path');
        
      if (menuError) {
        console.error("Errore nel caricamento delle icone menu:", menuError);
        return;
      }
      
      // 3. Identifica pagine senza icone
      const existingPaths = new Set(menuIcons?.map(icon => icon.path) || []);
      const pagesToSync = pages.filter(page => !existingPaths.has(page.path));
      
      if (pagesToSync.length === 0) {
        console.log("Tutte le pagine sono già sincronizzate");
        return;
      }
      
      console.log(`Da sincronizzare: ${pagesToSync.length} pagine`);
      
      // 4. Per ogni pagina, crea una nuova icona menu
      for (const page of pagesToSync) {
        const iconData = {
          label: page.title,
          path: page.path,
          icon: page.icon || 'FileText',
          bg_color: "bg-blue-200",
          is_submenu: page.parent_path !== null,
          parent_path: page.parent_path,
          published: true  // Imposta a true di default
        };
        
        // Prima inserisci l'icona
        try {
          const { error: insertError } = await supabase
            .from('menu_icons')
            .insert(iconData);
            
          if (insertError) {
            console.error(`Errore nell'inserimento dell'icona per ${page.path}:`, insertError);
            
            // Attendi un po' e riprova
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { error: retryError } = await supabase
              .from('menu_icons')
              .insert(iconData);
              
            if (retryError) {
              console.error(`Anche il secondo tentativo per ${page.path} è fallito:`, retryError);
            } else {
              console.log(`Icona per ${page.path} inserita con successo al secondo tentativo`);
            }
          } else {
            console.log(`Icona per ${page.path} inserita con successo`);
          }
        } catch (e) {
          console.error(`Errore non gestito per ${page.path}:`, e);
        }
        
        // Pausa breve tra gli inserimenti per evitare problemi di concorrenza
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log("Sincronizzazione completata");
      
      if (pagesToSync.length > 0) {
        toast.success(`${pagesToSync.length} pagine sincronizzate con il menu`);
      }
    } catch (error) {
      console.error("Errore nella sincronizzazione:", error);
    }
  };
  
  useEffect(() => {
    const initializeMenu = async () => {
      try {
        setLoading(true);
        console.log("Menu - Inizializzazione...");
        
        // Sincronizza prima tutte le pagine con il menu
        await syncPagesWithMenu();
        
        // Attendi un po' per dare tempo all'inserimento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verifica se abbiamo pagine disponibili
        const { count: pagesCount, error: countError } = await supabase
          .from('custom_pages')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);
          
        if (countError) {
          console.error("Errore nel conteggio delle pagine:", countError);
          throw countError;
        }
        
        console.log(`Numero di pagine pubblicate: ${pagesCount || 0}`);
        
        if (pagesCount && pagesCount > 0) {
          // Abbiamo pagine, dovremmo essere a posto
          setError(null);
        } else {
          // Nessuna pagina pubblicata
          console.warn("Non ci sono pagine pubblicate");
        }
      } catch (error) {
        console.error("Errore nell'inizializzazione del menu:", error);
        setError("Errore nel caricamento del menu. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };
    
    initializeMenu();
  }, []);
  
  const handleRefresh = () => {
    console.log("Menu - Aggiornamento manuale");
    setLoading(true);
    setRefreshTrigger(prev => prev + 1);
    setError(null);
    toast.info("Aggiornamento menu in corso...");
    
    // Sincronizza e poi ricarica
    syncPagesWithMenu().then(() => {
      setTimeout(() => {
        refreshHeaderSettings();
        setLoading(false);
        toast.success("Menu aggiornato");
      }, 1500);
    });
  };
  
  if (loading || headerLoading) {
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
