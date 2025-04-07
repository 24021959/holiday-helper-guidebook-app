
import React, { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { toast } from "sonner";
import FilteredIconNav from "@/components/FilteredIconNav";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
}

const Menu: React.FC = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const navigate = useNavigate();
  
  const fetchHeaderSettings = useCallback(async () => {
    try {
      // First try to get from localStorage as immediate fallback
      const savedHeaderSettings = localStorage.getItem("headerSettings");
      let localSettings = null;
      
      if (savedHeaderSettings) {
        try {
          localSettings = JSON.parse(savedHeaderSettings);
          setHeaderSettings(localSettings);
          console.log("Using cached header settings:", localSettings);
        } catch (err) {
          console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
        }
      }
      
      // Then try to get from Supabase
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.warn("Errore nel caricamento delle impostazioni header:", error);
        
        // If we already set from localStorage, don't show error
        if (localSettings) return;
        
        setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
        return;
      }
      
      if (data) {
        const newSettings = {
          logoUrl: data.logo_url,
          headerColor: data.header_color,
          establishmentName: data.establishment_name
        };
        
        setHeaderSettings(newSettings);
        
        // Salva in localStorage come backup
        localStorage.setItem("headerSettings", JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error("Errore nel caricamento delle impostazioni header:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const checkForPages = useCallback(async () => {
    try {
      // First try localStorage for cached icons
      const cachedIcons = localStorage.getItem("icons_root");
      if (cachedIcons) {
        try {
          const icons = JSON.parse(cachedIcons);
          console.log("Utilizzando icone in cache:", icons.length);
          return icons.length;
        } catch (err) {
          console.error("Errore nel parsing delle icone dalla cache:", err);
        }
      }
      
      const { count, error } = await supabase
        .from('menu_icons')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error("Errore nel conteggio delle icone:", error);
        throw error;
      }
      
      console.log("Numero totale di icone nel database:", count);
      return count;
    } catch (error) {
      console.error("Errore nel conteggio delle icone:", error);
      
      // Incrementa i tentativi di connessione
      setConnectionAttempts(prev => prev + 1);
      
      // Dopo 3 tentativi, mostra un errore più utile
      if (connectionAttempts >= 3) {
        setError("Sembra che ci siano problemi di connessione al database. Riprova più tardi o contatta l'amministratore.");
      }
      
      return 0;
    }
  }, [connectionAttempts]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchHeaderSettings();
        console.log("Menu - Forzando l'aggiornamento del menu all'avvio");
        
        // Controlla se ci sono pagine e forza l'aggiornamento a intervalli regolari
        const count = await checkForPages();
        console.log(`Trovate ${count} icone nel database`);
        
        // Forza l'aggiornamento del menu
        setRefreshTrigger(prev => prev + 1);
        
        // Se non ci sono icone o c'è un errore di connessione
        if (count === 0) {
          // Prova a ricaricare i dati più volte con backoff esponenziale
          const retryIntervals = [3000, 5000, 10000]; // 3s, 5s, 10s
          
          for (let i = 0; i < retryIntervals.length; i++) {
            // Aspetta il tempo specificato
            await new Promise(resolve => setTimeout(resolve, retryIntervals[i]));
            
            console.log(`Tentativo di riconnessione ${i + 1}...`);
            const newCount = await checkForPages();
            
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
  }, [fetchHeaderSettings, checkForPages]);
  
  const handleRefresh = () => {
    console.log("Menu - Refresh manuale attivato");
    setRefreshTrigger(prev => prev + 1);
    toast.info("Aggiornamento menu in corso...");
    
    // Reset error state on manual refresh
    setError(null);
    setLoading(true);
    
    // Ritenta la connessione
    fetchHeaderSettings().then(() => {
      checkForPages().then((count) => {
        if (count > 0) {
          toast.success("Menu aggiornato con successo");
        } else {
          toast.error("Impossibile aggiornare il menu. Riprova più tardi.");
        }
        setLoading(false);
      });
    });
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">
          <TranslatedText text="Caricamento menu..." />
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header con impostazioni personalizzate */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      {/* Contenitore principale con icone che occupa tutto lo spazio disponibile */}
      <div className="flex-1 flex flex-col overflow-auto">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
              <p className="text-red-500 mb-4">
                <TranslatedText text={error} />
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <TranslatedText text="Riprova" />
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <TranslatedText text="Ricarica pagina" />
                </button>
              </div>
            </div>
          </div>
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
