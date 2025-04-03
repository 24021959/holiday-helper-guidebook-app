
import React, { useEffect, useState } from "react";
import IconNav from "@/components/IconNav";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
}

const Menu: React.FC = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication first
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    const fetchHeaderSettings = async () => {
      try {
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
          });
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
        setError("Impossibile caricare le impostazioni dell'header");
        
        // Fallback al localStorage se Supabase fallisce
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeaderSettings();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/");
  };
  
  // Component for footer with logo
  const Footer = () => (
    <div className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 py-3 border-t border-gray-200">
      <div className="flex justify-center items-center">
        <img 
          src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
          alt="EVA AI Technologies Logo" 
          className="h-8 md:h-10" 
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">Caricamento menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Menu</h1>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <IconNav parentPath={null} />
      </div>
      
      <Footer />
    </div>
  );
};

export default Menu;
