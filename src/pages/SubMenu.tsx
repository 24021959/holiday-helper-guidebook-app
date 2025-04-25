import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TranslatedText from "@/components/TranslatedText";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import BackToMenu from "@/components/BackToMenu";
import FilteredIconNav from "@/components/FilteredIconNav";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/context/TranslationContext";

interface PageDetails {
  id: string;
  title: string;
}

const SubMenu: React.FC = () => {
  const { parentPath, language, path } = useParams<{ 
    parentPath: string;
    language?: string;
    path?: string;
  }>();
  const { headerSettings, loading: headerLoading } = useHeaderSettings();
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { language: currentLanguage, setLanguage } = useTranslation();
  
  const effectiveParentPath = (() => {
    if (language && path) {
      return `/${language}/${path}`;
    } else if (parentPath) {
      return `/${parentPath}`;
    }
    return null;
  })();
  
  console.log("SubMenu - URL params:", { parentPath, language, path });
  console.log("SubMenu - Effective parent path:", effectiveParentPath);
  
  useEffect(() => {
    if (language && ['it', 'en', 'fr', 'es', 'de'].includes(language)) {
      if (language !== currentLanguage) {
        console.log(`SubMenu - Setting language from URL params: ${language}`);
        setLanguage(language as 'it' | 'en' | 'fr' | 'es' | 'de');
      }
    }
  }, [language, currentLanguage, setLanguage]);
  
  const decodedPath = effectiveParentPath ? decodeURIComponent(effectiveParentPath) : null;
  
  console.log("SubMenu - Rendering with params:", {
    parentPath, language, path, effectiveParentPath, decodedPath
  });
  
  const fetchPageDetails = useCallback(async () => {
    if (!decodedPath) return;
    
    try {
      setLoading(true);
      
      console.log("SubMenu - Fetching page details for path:", decodedPath);
      
      let { data: pageData, error: pageError } = await supabase
        .from('custom_pages')
        .select('id, title, path')
        .eq('path', decodedPath)
        .eq('published', true)
        .maybeSingle();

      if (!pageData && !pageError) {
        console.log("No exact path match, trying case-insensitive match");
        const { data: fuzzyPageData, error: fuzzyError } = await supabase
          .from('custom_pages')
          .select('id, title, path')
          .ilike('path', decodedPath)
          .eq('published', true)
          .maybeSingle();

        if (!fuzzyError && fuzzyPageData) {
          pageData = fuzzyPageData;
          console.log("Found page with case-insensitive match:", fuzzyPageData);
        }
      }
        
      if (pageError) {
        console.error("Error loading parent page details:", pageError);
        setError("Error loading page details");
      } else if (pageData) {
        setPageDetails({
          id: pageData.id,
          title: pageData.title
        });
        console.log("Loaded parent page details:", pageData);
      } else {
        console.log("No parent page found for path:", decodedPath);
        setError("Parent page not found");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  }, [decodedPath]);

  useEffect(() => {
    fetchPageDetails();
  }, [fetchPageDetails, refreshTrigger]);

  const handleRefresh = () => {
    setError(null);
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing menu...");
  };

  if (loading || headerLoading) {
    return <LoadingView message="Loading submenu..." fullScreen={true} />;
  }

  return (
    <div className={`flex flex-col h-screen ${isMobile ? 'w-full p-0 m-0 max-w-none' : ''}`}>
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
        <BackToMenu showBackButton={false} />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          {pageDetails ? <TranslatedText text={pageDetails.title} /> : "Submenu"}
        </h1>
      </div>
      
      <div className="flex-1 flex flex-col overflow-auto">
        {error ? (
          <ErrorView 
            message={error || "Error loading submenu"}
            onRefresh={handleRefresh}
            onAlternativeAction={() => {
              if (currentLanguage === 'it') {
                navigate('/menu');
              } else {
                navigate(`/${currentLanguage}/menu`);
              }
            }}
            alternativeActionText="Back to menu"
          />
        ) : (
          <FilteredIconNav 
            parentPath={decodedPath} 
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SubMenu;
