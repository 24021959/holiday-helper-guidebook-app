
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string | null;
  establishmentName?: string | null;
  logoPosition?: string | null;
  logoSize?: string | null; 
}

export const useHeaderSettings = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  // Default settings to use as fallback
  const defaultSettings: HeaderSettings = {
    headerColor: "bg-gradient-to-r from-teal-500 to-emerald-600",
    logoPosition: "left",
    logoSize: "medium",
    establishmentName: "Locanda dell'Angelo"
  };

  const fetchHeaderSettings = useCallback(async () => {
    try {
      console.log("Fetching header settings...");
      setError(null);
      
      // Check if we're in demo mode 
      const adminToken = localStorage.getItem("admin_token");
      const isLoggedInAsDemo = adminToken === "demo_token" || adminToken === "master_token";
      
      // First try to get from localStorage as immediate fallback
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
      
      if (isLoggedInAsDemo) {
        console.log("Using demo mode for header settings");
        setIsDemo(true);
        
        const demoSettings = {
          headerColor: "bg-gradient-to-r from-teal-500 to-emerald-600",
          logoPosition: "left",
          logoSize: "medium",
          establishmentName: adminToken === "master_token" ? "EV-AI Master" : "Locanda dell'Angelo"
        };
        
        // Only use default settings if we don't have cached settings
        if (!localSettings) {
          setHeaderSettings(demoSettings);
          localStorage.setItem("headerSettings", JSON.stringify(demoSettings));
        }
        
        setLoading(false);
        return;
      }
      
      // Then try to get from Supabase
      try {
        console.log("Trying to fetch settings from Supabase...");
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
          
        if (error) {
          // If the table doesn't exist, that's OK in demo mode
          if (error.code === '42P01') {
            console.warn("Header settings table does not exist. Using defaults or localStorage.");
            // If we already have local settings, don't show error
            if (localSettings) {
              setLoading(false);
              return;
            }
            
            // Set default values
            setHeaderSettings(defaultSettings);
            localStorage.setItem("headerSettings", JSON.stringify(defaultSettings));
            setLoading(false);
            setIsDemo(true);
            return;
          }
          
          console.warn("Error loading header settings:", error);
          
          // If we already set from localStorage, don't show error
          if (localSettings) {
            setLoading(false);
            return;
          }
          
          setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
          
          // Set default values as fallback
          setHeaderSettings(defaultSettings);
          localStorage.setItem("headerSettings", JSON.stringify(defaultSettings));
          setIsDemo(true);
          setLoading(false);
          return;
        }
        
        if (data) {
          console.log("Received data from Supabase:", data);
          const newSettings = {
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name || "Locanda dell'Angelo",
            logoPosition: data.logo_position || "left",
            logoSize: data.logo_size || "medium"
          };
          
          setHeaderSettings(newSettings);
          
          // Save in localStorage as backup
          localStorage.setItem("headerSettings", JSON.stringify(newSettings));
        } else if (!localSettings) {
          // If no data from server and no local settings, use defaults
          setHeaderSettings(defaultSettings);
          localStorage.setItem("headerSettings", JSON.stringify(defaultSettings));
          setIsDemo(true);
        }
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        
        // If we already have local settings, don't show error toast
        if (!localSettings) {
          // Set default values as fallback
          setHeaderSettings(defaultSettings);
          localStorage.setItem("headerSettings", JSON.stringify(defaultSettings));
          setIsDemo(true);
          
          setError("Impossibile connettersi al database. Utilizzando valori predefiniti.");
        }
      }
    } catch (error) {
      console.error("Error loading header settings:", error);
      
      // If we already have local settings, don't show error toast
      const savedHeaderSettings = localStorage.getItem("headerSettings");
      if (!savedHeaderSettings) {
        // Set default values as fallback
        setHeaderSettings(defaultSettings);
        localStorage.setItem("headerSettings", JSON.stringify(defaultSettings));
        setIsDemo(true);
      }
      
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
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
    isDemo,
    refreshHeaderSettings: fetchHeaderSettings
  };
};
