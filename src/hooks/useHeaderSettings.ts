
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
      let localSettings: HeaderSettings | null = null;
      try {
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          localSettings = JSON.parse(savedHeaderSettings);
          setHeaderSettings(localSettings);
          console.log("Using cached header settings:", localSettings);
        }
      } catch (err) {
        console.error("Error parsing settings from localStorage:", err);
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
        const newSettings: HeaderSettings = {
          logoUrl: data.logo_url,
          headerColor: data.header_color,
          establishmentName: data.establishment_name,
          logoPosition: data.logo_position as "left" | "center" | "right",
          logoSize: data.logo_size as "small" | "medium" | "large",
          establishmentNameAlignment: data.establishment_name_alignment as "left" | "center" | "right",
          establishmentNameColor: data.establishment_name_color
        };
        
        setHeaderSettings(newSettings);
        
        // Save in localStorage as backup
        try {
          localStorage.setItem("headerSettings", JSON.stringify(newSettings));
          console.log("Updated header settings from database:", newSettings);
        } catch (e) {
          console.warn("Could not cache settings in localStorage:", e);
        }
      } else if (!localSettings) {
        // No data found and no local settings, set defaults
        console.log("No header settings found, using defaults");
        const defaultSettings: HeaderSettings = {
          headerColor: "bg-white",
          establishmentName: "Locanda dell'Angelo",
          logoPosition: "left",
          logoSize: "medium",
          establishmentNameAlignment: "left",
          establishmentNameColor: "#000000"
        };
        setHeaderSettings(defaultSettings);
        
        // Try to save defaults to localStorage
        try {
          localStorage.setItem("headerSettings", JSON.stringify(defaultSettings));
        } catch (e) {
          console.warn("Could not cache settings in localStorage:", e);
        }
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
