
import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingView from "@/components/LoadingView";
import ErrorView from "@/components/ErrorView";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import IconNav from "@/components/IconNav";

interface IconData {
  id: string;
  path: string;
  label: string;
  icon: string;
  parent_path: string | null;
  title?: string;
  is_parent?: boolean;
}

const Menu: React.FC = () => {
  const { headerSettings, loading: headerLoading, error: headerError, refreshHeaderSettings } = useHeaderSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootPages, setRootPages] = useState<IconData[]>([]);
  
  // Load all main pages (without parent_path)
  const loadRootPages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Menu - Loading main pages");
      
      // Get all pages without a parent
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .is('parent_path', null)
        .eq('published', true);
          
      if (pagesError) {
        console.error("Error loading pages:", pagesError);
        throw pagesError;
      }
      
      if (!pages || pages.length === 0) {
        console.log("No main pages found");
        setRootPages([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${pages.length} main pages:`, pages);
      
      // Convert pages to menu icons (all initially not parents)
      const iconData = pages.map(page => ({
        id: page.id,
        path: page.path,
        label: page.title,
        icon: page.icon || 'FileText',
        parent_path: page.parent_path,
        is_parent: false // Will check for children later
      }));
      
      // Force set initial state
      setRootPages(iconData);
      
      // Check each page to see if it has subpages and mark as parent if needed
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
            console.log(`Page ${icon.path} has ${count} children, marking as parent`);
            updatedIcons[i] = { ...icon, is_parent: true };
          }
        }
      }
      
      // Update state with parent information
      setRootPages(updatedIcons);
      
    } catch (error) {
      console.error("Error loading main pages:", error);
      setError("Error loading menu. Try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadRootPages();
  }, [loadRootPages, refreshTrigger]);
  
  const handleRefresh = () => {
    console.log("Menu - Manual refresh");
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing menu...");
    refreshHeaderSettings();
  };
  
  if (headerLoading || isLoading) {
    return <LoadingView message="Loading menu..." fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header with custom settings but NO admin button */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      {/* Main container with icons that takes all available space */}
      <div className="flex-1 flex flex-col overflow-auto">
        {error || headerError ? (
          <ErrorView 
            message={error || headerError || "Loading error"}
            onRefresh={handleRefresh}
            onAlternativeAction={() => window.location.reload()}
            alternativeActionText="Reload page"
          />
        ) : (
          <IconNav 
            icons={rootPages} 
            parentPath={null} 
            onRefresh={handleRefresh} 
          />
        )}
      </div>
      
      {/* Footer with logo */}
      <Footer />
    </div>
  );
};

export default Menu;
