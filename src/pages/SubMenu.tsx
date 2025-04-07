
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import FilteredIconNav from "@/components/FilteredIconNav";
import NavigateBack from "@/components/NavigateBack";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First check localStorage for header settings
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        let localSettings = null;
        
        if (savedHeaderSettings) {
          try {
            localSettings = JSON.parse(savedHeaderSettings);
            setHeaderSettings(localSettings);
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
        
        // 1. Fetch header settings from Supabase
        const { data: headerData, error: headerError } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (headerError) {
          console.error("Errore nel caricamento delle impostazioni header:", headerError);
          
          // If we didn't set from localStorage, show error
          if (!localSettings) {
            setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
          }
        } else if (headerData) {
          const newSettings = {
            logoUrl: headerData.logo_url,
            headerColor: headerData.header_color,
            establishmentName: headerData.establishment_name
          };
          
          setHeaderSettings(newSettings);
          
          // Save to localStorage as backup
          localStorage.setItem("headerSettings", JSON.stringify(newSettings));
        }
        
        // 2. Fetch parent page details
        if (parentPath) {
          const realPath = `/${parentPath}`;
          const { data: pageData, error: pageError } = await supabase
            .from('custom_pages')
            .select('id, title')
            .eq('path', realPath)
            .single();
            
          if (pageError) {
            console.error("Errore nel caricamento dei dettagli della pagina:", pageError);
          } else if (pageData) {
            setPageDetails({
              id: pageData.id,
              title: pageData.title
            });
            
            // Store in localStorage for future quick access
            localStorage.setItem(`pageDetails_${parentPath}`, JSON.stringify({
              id: pageData.id,
              title: pageData.title
            }));
          } else {
            // Try to get from localStorage
            const savedPageDetails = localStorage.getItem(`pageDetails_${parentPath}`);
            if (savedPageDetails) {
              try {
                setPageDetails(JSON.parse(savedPageDetails));
              } catch (err) {
                console.error("Errore nel parsing dei dettagli della pagina dal localStorage:", err);
              }
            }
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        setError("Impossibile caricare il sottomenu. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [parentPath, refreshTrigger]);

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleRefresh = () => {
    setError(null);
    setRefreshTrigger(prev => prev + 1);
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
        <NavigateBack />
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
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <TranslatedText text="Riprova" />
                </button>
                <button 
                  onClick={() => navigate('/menu')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <TranslatedText text="Torna al menu" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <FilteredIconNav 
            parentPath={`/${parentPath}`} 
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefresh}
          />
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SubMenu;
