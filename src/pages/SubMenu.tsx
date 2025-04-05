
import React, { useEffect, useState } from "react";
import IconNav from "@/components/IconNav";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
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
            establishmentName: headerData.establishment_name
          });
          
          // Save to localStorage as backup
          localStorage.setItem("headerSettings", JSON.stringify({
            logoUrl: headerData.logo_url,
            headerColor: headerData.header_color,
            establishmentName: headerData.establishment_name
          }));
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
        
        // Fallback to localStorage for header settings
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
        
        setError("Impossibile caricare il sottomenu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [parentPath]);

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">
          <TranslatedText text="Caricamento sottomenu..." />
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
      
      {/* Submenu title with back button */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
        <button 
          onClick={handleBackToMenu}
          className="mr-2 p-1 rounded-full hover:bg-teal-200 transition-colors"
          aria-label="Back to menu"
        >
          <ArrowLeft className="h-5 w-5 text-emerald-700" />
        </button>
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          {pageDetails ? (
            <TranslatedText text={pageDetails.title} />
          ) : (
            <TranslatedText text="Sottomenu" />
          )}
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
                onClick={() => navigate('/menu')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                <TranslatedText text="Torna al menu" />
              </button>
            </div>
          </div>
        ) : (
          <IconNav parentPath={`/${parentPath}`} />
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SubMenu;
