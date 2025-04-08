
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TranslatedText from "@/components/TranslatedText";
import NavigateBack from "@/components/NavigateBack";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import IconNav from "@/components/IconNav";

interface PageDetails {
  id: string;
  title: string;
}

interface IconData {
  id: string;
  path: string;
  label: string;
  icon: string;
  parent_path: string | null;
  title?: string;
  is_parent?: boolean;
}

const SubMenu: React.FC = () => {
  const { parentPath } = useParams<{ parentPath: string }>();
  const { headerSettings, loading: headerLoading } = useHeaderSettings();
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [subPages, setSubPages] = useState<IconData[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPageDetails = async () => {
      try {
        setLoading(true);
        
        if (parentPath) {
          const realPath = `/${parentPath}`;
          console.log("Fetching page details for path:", realPath);
          
          // Load parent page details
          const { data: pageData, error: pageError } = await supabase
            .from('custom_pages')
            .select('id, title')
            .eq('path', realPath)
            .eq('published', true)
            .maybeSingle();
            
          if (pageError) {
            console.error("Error loading page details:", pageError);
            setError("Error loading page details");
          } else if (pageData) {
            const details = {
              id: pageData.id,
              title: pageData.title
            };
            
            setPageDetails(details);
            console.log("Loaded page details from database:", details);
          } else {
            console.log("No page details found for path:", realPath);
            setError("Page not found");
          }
          
          // Load subpages for this parent
          const { data: subpages, error: subpagesError } = await supabase
            .from('custom_pages')
            .select('id, title, path, icon, parent_path')
            .eq('parent_path', realPath)
            .eq('published', true);
            
          if (subpagesError) {
            console.error("Error loading subpages:", subpagesError);
            setError("Error loading subpages");
          } else if (subpages && subpages.length > 0) {
            console.log(`Found ${subpages.length} subpages for parent ${realPath}:`, subpages);
            
            // Convert pages to icons for the menu
            const iconData = subpages.map(page => ({
              id: page.id,
              path: page.path,
              label: page.title,
              icon: page.icon || 'FileText',
              parent_path: page.parent_path,
              is_parent: false // Assume subpages are not parents themselves
            }));
            
            setSubPages(iconData);
          } else {
            console.log("No subpages found for parent:", realPath);
            setSubPages([]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageDetails();
  }, [parentPath, refreshTrigger]);

  const handleRefresh = () => {
    setError(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading || headerLoading) {
    return <LoadingView message="Loading submenu..." fullScreen={true} />;
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
            <TranslatedText text="Submenu" />
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
            alternativeActionText="Back to menu"
          />
        ) : (
          <IconNav 
            icons={subPages} 
            parentPath={`/${parentPath}`} 
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
