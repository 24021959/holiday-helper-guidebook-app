
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TranslatedText from "@/components/TranslatedText";
import FilteredIconNav from "@/components/FilteredIconNav";
import NavigateBack from "@/components/NavigateBack";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useEffect } from "react";

interface PageDetails {
  id: string;
  title: string;
}

const SubMenu: React.FC = () => {
  const { parentPath } = useParams<{ parentPath: string }>();
  const { headerSettings, loading: headerLoading } = useHeaderSettings();
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPageDetails = async () => {
      try {
        setLoading(true);
        
        if (parentPath) {
          const realPath = `/${parentPath}`;
          console.log("Fetching page details for path:", realPath);
          
          const cachedDetails = localStorage.getItem(`pageDetails_${parentPath}`);
          if (cachedDetails) {
            try {
              const parsedDetails = JSON.parse(cachedDetails);
              console.log("Using cached page details:", parsedDetails);
              setPageDetails(parsedDetails);
            } catch (err) {
              console.error("Error parsing page details from cache:", err);
            }
          }
          
          const { data: pageData, error: pageError } = await supabase
            .from('custom_pages')
            .select('id, title')
            .eq('path', realPath)
            .maybeSingle();
            
          if (pageError) {
            console.error("Error loading page details:", pageError);
            setError("Errore nel caricamento dei dettagli della pagina");
          } else if (pageData) {
            const details = {
              id: pageData.id,
              title: pageData.title
            };
            
            setPageDetails(details);
            console.log("Loaded page details from database:", details);
            
            // Store in localStorage for future quick access
            localStorage.setItem(`pageDetails_${parentPath}`, JSON.stringify(details));
          } else {
            console.log("No page details found for path:", realPath);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageDetails();
  }, [parentPath]);

  const handleRefresh = () => {
    setError(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading || headerLoading) {
    return <LoadingView message="Caricamento sottomenu..." fullScreen={true} />;
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
          <ErrorView 
            message={error}
            onRefresh={handleRefresh}
            onAlternativeAction={() => navigate('/menu')}
            alternativeActionText="Torna al menu"
          />
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
