
import React, { useEffect, useState } from "react";
import IconNav from "@/components/IconNav";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
}

interface PageDetails {
  id: string;
  title: string;
}

const SubMenu: React.FC = () => {
  const { parentPath } = useParams<{ parentPath: string }>();
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch header settings
        const { data: headerData, error: headerError } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (headerError) throw headerError;
        
        if (headerData) {
          setHeaderSettings({
            logoUrl: headerData.logo_url,
            headerColor: headerData.header_color,
          });
        }
        
        // 2. Fetch parent page details
        if (parentPath) {
          const realPath = `/${parentPath}`;
          const { data: pageData, error: pageError } = await supabase
            .from('custom_pages')
            .select('id, title')
            .eq('path', realPath)
            .single();
            
          if (pageError) throw pageError;
          
          if (pageData) {
            setPageDetails({
              id: pageData.id,
              title: pageData.title
            });
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        setError("Impossibile caricare il sottomenu");
        
        // Fallback al localStorage per le impostazioni dell'header
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
    
    fetchData();
  }, [parentPath]);
  
  // Component for footer with credentials
  const Footer = () => (
    <div className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 py-3 border-t border-gray-200">
      <div className="text-center text-gray-500 text-xs">
        © 2025 Powered by EV-AI Technologies
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">Caricamento sottomenu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/menu')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Torna al menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header con le impostazioni personalizzate */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        showAdminButton={false}
      />
      
      {/* Titolo del sottomenu */}
      {pageDetails && (
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm">
          <h1 className="text-xl font-medium text-emerald-800 text-center">
            {pageDetails.title}
          </h1>
        </div>
      )}
      
      {/* Contenitore principale con le icone che prende tutto lo spazio disponibile */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <IconNav parentPath={`/${parentPath}`} />
      </div>
      
      {/* Footer con credenziali */}
      <Footer />
    </div>
  );
};

export default SubMenu;
