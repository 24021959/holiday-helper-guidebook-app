
import React, { useState, useEffect, useCallback } from "react";
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
import BackToMenu from "@/components/BackToMenu";

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
  
  const fetchData = useCallback(async () => {
    if (!parentPath) return;
    
    try {
      setLoading(true);
      const realPath = `/${parentPath}`;
      
      // 1. Load parent page details
      const { data: pageData, error: pageError } = await supabase
        .from('custom_pages')
        .select('id, title')
        .eq('path', realPath)
        .eq('published', true)
        .maybeSingle();
        
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
      
      // 2. Load all subpages for this parent
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
        
        // First set the initial subpages
        const iconData = subpages.map(page => ({
          id: page.id,
          path: page.path,
          label: page.title,
          icon: page.icon || 'FileText',
          parent_path: page.parent_path,
          title: page.title,
          is_parent: false // Initially assume none are parents
        }));
        
        setSubPages(iconData);
        
        // Then check if any of these subpages are themselves parents
        const updatedIcons = [...iconData];
        
        for (let i = 0; i < updatedIcons.length; i++) {
          const icon = updatedIcons[i];
          if (icon.path) {
            const { count, error: countError } = await supabase
              .from('custom_pages')
              .select('id', { count: 'exact', head: true })
              .eq('parent_path', icon.path)
              .eq('published', true);
            
            if (!countError && count !== null && count > 0) {
              console.log(`Subpage ${icon.path} has ${count} children, marking as parent`);
              updatedIcons[i] = { ...icon, is_parent: true };
            }
          }
        }
        
        // Update with parent information
        setSubPages(updatedIcons);
        
      } else {
        console.log("No subpages found for parent:", realPath);
        setSubPages([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  }, [parentPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

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
        <BackToMenu />
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
