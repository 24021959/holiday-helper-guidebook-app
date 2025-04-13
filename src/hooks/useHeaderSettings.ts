
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
  logoPosition?: "left" | "center" | "right";
  logoSize?: "small" | "medium" | "large"; 
}

export const useHeaderSettings = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeaderSettings = useCallback(async () => {
    try {
      // Prima prova a ottenere da localStorage come fallback immediato
      const savedHeaderSettings = localStorage.getItem("headerSettings");
      let localSettings = null;
      
      if (savedHeaderSettings) {
        try {
          localSettings = JSON.parse(savedHeaderSettings);
          setHeaderSettings(localSettings);
          console.log("Utilizzo impostazioni header in cache:", localSettings);
        } catch (err) {
          console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
        }
      }
      
      // Poi prova a ottenere da Supabase
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.warn("Errore nel caricamento delle impostazioni header:", error);
        
        // Se abbiamo già impostato da localStorage, non mostrare errore
        if (localSettings) return;
        
        setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
        return;
      }
      
      if (data) {
        const newSettings = {
          logoUrl: data.logo_url,
          headerColor: data.header_color,
          establishmentName: data.establishment_name,
          logoPosition: data.logo_position || "left",
          logoSize: data.logo_size || "medium"
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

  useEffect(() => {
    fetchHeaderSettings();
  }, [fetchHeaderSettings]);

  return {
    headerSettings,
    loading: loading,
    error,
    refreshHeaderSettings: fetchHeaderSettings
  };
};
