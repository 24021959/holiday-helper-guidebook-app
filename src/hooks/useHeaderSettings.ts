
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
  logoPosition?: "left" | "center" | "right";
  logoSize?: "small" | "medium" | "large"; 
  establishmentNameAlignment?: "left" | "center" | "right";
  establishmentNameColor?: string;
}

export const useHeaderSettings = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeaderSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check localStorage as immediate fallback
      const savedHeaderSettings = localStorage.getItem("headerSettings");
      let localSettings = null;
      
      if (savedHeaderSettings) {
        try {
          localSettings = JSON.parse(savedHeaderSettings);
          setHeaderSettings(localSettings);
          console.log("Using cached header settings:", localSettings);
        } catch (err) {
          console.error("Error parsing settings from localStorage:", err);
        }
      }
      
      // Then try to fetch from Supabase
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.warn("Error loading header settings:", error);
        
        // If we already have local settings, don't show error
        if (!localSettings) {
          setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
        }
        return;
      }
      
      if (data) {
        const newSettings = {
          logoUrl: data.logo_url,
          headerColor: data.header_color,
          establishmentName: data.establishment_name,
          logoPosition: data.logo_position || "left",
          logoSize: data.logo_size || "medium",
          establishmentNameAlignment: data.establishment_name_alignment || "left",
          establishmentNameColor: data.establishment_name_color || "#000000"
        };
        
        setHeaderSettings(newSettings);
        
        // Save in localStorage as backup
        localStorage.setItem("headerSettings", JSON.stringify(newSettings));
        console.log("Updated header settings from database:", newSettings);
      } else if (!localSettings) {
        // No data found and no local settings
        console.log("No header settings found");
        setHeaderSettings({
          headerColor: "bg-white",
          establishmentName: "Locanda dell'Angelo",
          logoPosition: "left",
          logoSize: "medium",
          establishmentNameAlignment: "left",
          establishmentNameColor: "#000000"
        });
      }
    } catch (error) {
      console.error("Error loading header settings:", error);
      if (!headerSettings || Object.keys(headerSettings).length === 0) {
        setError("Si è verificato un errore durante il caricamento delle impostazioni. Riprova più tardi.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeaderSettings();
  }, [fetchHeaderSettings]);

  return {
    headerSettings,
    loading,
    error,
    refreshHeaderSettings: fetchHeaderSettings
  };
};
