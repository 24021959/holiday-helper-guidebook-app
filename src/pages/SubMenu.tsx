
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
  
  // Handle path with special characters (like accented letters)
  const decodedPath = parentPath ? decodeURIComponent(parentPath) : null;
  // Always prepend / to the path for database lookups
  const realPath = decodedPath ? `/${decodedPath}` : null;
  
  console.log("SubMenu - Rendering with parentPath:", parentPath);
  console.log("SubMenu - Decoded path:", decodedPath);
  console.log("SubMenu - Real path for database lookup:", realPath);
  
  // Load parent page details
  const fetchPageDetails = useCallback(async () => {
    if (!parentPath) return;
    
    try {
      setLoading(true);
      
      console.log("SubMenu - Fetching page details for path:", realPath);
      
      // Try with exact match first
      let { data: pageData, error: pageError } = await supabase
        .from('custom_pages')
        .select('id, title')
        .eq('path', realPath)
        .eq('published', true)
        .maybeSingle();

      // If no exact match, try case-insensitive match
      if (!pageData && !pageError) {
        console.log("No exact path match, trying case-insensitive match");
        const { data: fuzzyPageData, error: fuzzyError } = await supabase
          .from('custom_pages')
          .select('id, title')
          .ilike('path', realPath)
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
        console.log("No parent page found for path:", realPath);
        setError("Parent page not found");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  }, [parentPath, realPath]);

  useEffect(() => {
    fetchPageDetails();
  }, [fetchPageDetails, refreshTrigger]);

  const handleRefresh = () => {
    setError(null);
    setRefreshTrigger(prev => prev + 1);
    toast.info(<TranslatedText text="Refreshing menu..." />);
  };

  if (loading || headerLoading) {
    return <LoadingView message={<TranslatedText text="Loading submenu..." />} fullScreen={true} />;
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
      
      {/* Submenu title with home button only (no back button) */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
        <BackToMenu showBackButton={false} />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          {pageDetails ? (
            <TranslatedText text={pageDetails.title} />
          ) : (
            <TranslatedText text="Submenu" />
          )}
        </h1>
      </div>
      
      {/* Main container with icons that takes all available space */}
      <div className="flex-1 flex flex-col overflow-auto">
        {error ? (
          <ErrorView 
            message={<TranslatedText text={error || "Error loading submenu"} />}
            onRefresh={handleRefresh}
            onAlternativeAction={() => navigate('/menu')}
            alternativeActionText={<TranslatedText text="Back to menu" />}
          />
        ) : (
          <FilteredIconNav 
            parentPath={realPath} 
            onRefresh={handleRefresh}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SubMenu;
