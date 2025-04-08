
import React, { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const navigate = useNavigate();
  
  // Funzione migliorata per sincronizzare le pagine con le icone del menu
  const syncPagesToMenuIcons = useCallback(async () => {
    try {
      console.log("Sincronizzazione pagine con icone del menu...");
      
      // Ottieni tutte le pagine pubblicate
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path')
        .eq('published', true);
        
      if (pagesError) {
        console.error("Errore nel recupero delle pagine:", pagesError);
        return;
      }
      
      if (!pages || pages.length === 0) {
        console.log("Nessuna pagina da sincronizzare");
        return;
      }
      
      // Ottieni tutte le icone del menu
      const { data: menuIcons, error: iconsError } = await supabase
        .from('menu_icons')
        .select('path');
        
      if (iconsError) {
        console.error("Errore nel recupero delle icone del menu:", iconsError);
        return;
      }
      
      // Crea un set con i percorsi delle icone per una ricerca veloce
      const iconPaths = new Set(menuIcons?.map(icon => icon.path) || []);
      
      // Trova le pagine che non hanno un'icona corrispondente
      const pagesToSync = pages.filter(page => !iconPaths.has(page.path));
      
      if (pagesToSync.length === 0) {
        console.log("Tutte le pagine sono già sincronizzate");
        return;
      }
      
      console.log(`Trovate ${pagesToSync.length} pagine da sincronizzare con le icone del menu`);
      
      // Crea le nuove icone del menu
      const newIcons = pagesToSync.map(page => ({
        label: page.title,
        path: page.path,
        icon: page.icon || 'FileText',
        bg_color: "bg-blue-200",
        is_submenu: page.parent_path !== null,
        parent_path: page.parent_path,
        published: true
      }));
      
      // Inserisci le nuove icone in batch di 20 per evitare errori di dimensione
      let processed = 0;
      while (processed < newIcons.length) {
        const batch = newIcons.slice(processed, processed + 20);
        const { error: insertError } = await supabase
          .from('menu_icons')
          .insert(batch);
          
        if (insertError) {
          console.error(`Errore nell'inserimento del batch ${processed}-${processed+batch.length}:`, insertError);
        } else {
          console.log(`Batch ${processed}-${processed+batch.length} inserito con successo`);
        }
        
        processed += batch.length;
      }
      
      console.log(`Sincronizzate con successo ${newIcons.length} pagine`);
      
      if (newIcons.length > 0) {
        toast.success(`${newIcons.length} pagine aggiunte al menu`);
      }
      
    } catch (error) {
      console.error("Errore nella sincronizzazione delle pagine:", error);
    }
  }, []);
  
  const checkForPagesOrIcons = useCallback(async () => {
    try {
      // Prima prova localStorage per icone in cache
      const cachedIcons = localStorage.getItem("icons_root");
      if (cachedIcons) {
        try {
          const icons = JSON.parse(cachedIcons);
          console.log("Utilizzando icone in cache:", icons.length);
          
          if (icons.length > 0) {
            return icons.length;
          }
        } catch (err) {
          console.error("Errore nel parsing delle icone dalla cache:", err);
        }
      }
      
      // Prova a verificare la presenza di pagine pubblicate direttamente
      console.log("Verifica pagine pubblicate");
      const { count: pagesCount, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
        .eq('parent_path', null);
        
      if (pagesError) {
        console.error("Errore nel conteggio delle pagine pubblicate:", pagesError);
        throw pagesError;
      }
      
      if (pagesCount && pagesCount > 0) {
        console.log("Numero di pagine pubblicate nel menu principale:", pagesCount);
        
        // Sincronizza le pagine con le icone del menu
        await syncPagesToMenuIcons();
        
        return pagesCount;
      }
      
      // Se non ci sono pagine pubblicate, prova la tabella menu_icons
      const { count: iconsCount, error: iconsError } = await supabase
        .from('menu_icons')
        .select('*', { count: 'exact', head: true })
        .eq('parent_path', null);
        
      if (iconsError) {
        console.error("Errore nel conteggio delle icone del menu:", iconsError);
        throw iconsError;
      }
      
      console.log("Numero di icone nel menu principale:", iconsCount);
      return iconsCount || 0;
    } catch (error) {
      console.error("Errore nel conteggio delle icone o pagine:", error);
      
      // Incrementa i tentativi di connessione
      setConnectionAttempts(prev => prev + 1);
      
      // Dopo 3 tentativi, mostra un errore più utile
      if (connectionAttempts >= 3) {
        setError("Sembra che ci siano problemi di connessione al database. Riprova più tardi o contatta l'amministratore.");
      }
      
      return 0;
    }
  }, [connectionAttempts, syncPagesToMenuIcons]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Menu - Forzando l'aggiornamento del menu all'avvio");
        
        // Prima sincronizza forzatamente tutte le pagine con le icone del menu
        await syncPagesToMenuIcons();
        
        // Attendi un po' per dare tempo al database di aggiornare i dati
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Controlla se ci sono pagine o icone e forza l'aggiornamento
        const count = await checkForPagesOrIcons();
        console.log(`Trovate ${count} icone o pagine nel menu principale`);
        
        // Forza l'aggiornamento del menu
        setRefreshTrigger(prev => prev + 1);
        
        // Se non ci sono icone o pagine o c'è un errore di connessione
        if (count === 0) {
          // Prova a ricaricare i dati più volte con backoff esponenziale
          const retryIntervals = [3000, 5000, 10000]; // 3s, 5s, 10s
          
          for (let i = 0; i < retryIntervals.length; i++) {
            // Aspetta il tempo specificato
            await new Promise(resolve => setTimeout(resolve, retryIntervals[i]));
            
            console.log(`Tentativo di riconnessione ${i + 1}...`);
            
            // Riprova la sincronizzazione
            await syncPagesToMenuIcons();
            
            // Attendi per dare tempo all'aggiornamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newCount = await checkForPagesOrIcons();
            
            if (newCount > 0) {
              console.log("Connessione riuscita, aggiornamento menu");
              setRefreshTrigger(prev => prev + 1);
              setError(null);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };
    
    loadData();
  }, [refreshHeaderSettings, checkForPagesOrIcons, syncPagesToMenuIcons]);
  
  const handleRefresh = () => {
    console.log("Menu - Refresh manuale attivato");
    setLoading(true);
    setRefreshTrigger(prev => prev + 1);
    setError(null);
    toast.info("Aggiornamento menu in corso...");
    
    // Sincronizza le pagine e ricarica il menu
    syncPagesToMenuIcons().then(() => {
      // Attendi un po' per dare tempo al database di aggiornare
      setTimeout(() => {
        // Ritenta la connessione
        refreshHeaderSettings().then(() => {
          checkForPagesOrIcons().then((count) => {
            if (count > 0) {
              toast.success("Menu aggiornato con successo");
            } else {
              toast.error("Impossibile aggiornare il menu. Riprova più tardi.");
            }
            setLoading(false);
          });
        });
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
