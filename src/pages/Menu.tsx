
import React, { useEffect, useState } from "react";
import IconNav from "@/components/IconNav";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
}

const Menu: React.FC = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setHeaderSettings({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name
          });
          
          // Save to localStorage as backup
          localStorage.setItem("headerSettings", JSON.stringify({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name
          }));
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
        
        // Fallback to localStorage if Supabase fails
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
            setError("Impossibile caricare le impostazioni");
          }
        } else {
          setError("Impossibile caricare le impostazioni dell'header");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeaderSettings();
  }, []);
  
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
      {/* Header with customized settings */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      {/* Title for the menu */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm">
        <h1 className="text-xl font-medium text-emerald-800 text-center">
          <TranslatedText text="Menu principale" />
        </h1>
      </div>
      
      {/* Main container with icons that takes all available space */}
      <div className="flex-1 flex flex-col overflow-auto">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
              <p className="text-red-500 mb-4">
                <TranslatedText text={error} />
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                <TranslatedText text="Riprova" />
              </button>
            </div>
          </div>
        ) : (
          <IconNav parentPath={null} />
        )}
      </div>
      
      {/* Footer with logo */}
      <Footer />
    </div>
  );
};

export default Menu;
