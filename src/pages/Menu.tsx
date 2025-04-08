
import React, { useState, useEffect } from "react";
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
  useEffect(() => {
    const loadRootPages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Menu - Loading main pages");
        
        // Get all parent pages and regular pages without a parent
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
        } else {
          console.log(`Found ${pages.length} main pages:`, pages);
          
          // Convert pages to menu icons
          const iconData = pages.map(page => {
            // Check if this page has any children (is a parent)
            const hasChildren = page.path && page.path.trim() !== '';
            
            return {
              id: page.id,
              path: page.path,
              label: page.title,
              icon: page.icon || 'FileText',
              parent_path: page.parent_path,
              // Consider it a parent if it is marked as such based on path structure
              is_parent: hasChildren
            };
          });
          
          setRootPages(iconData);
          
          // For each possible parent page, check if it actually has children
          if (iconData.length > 0) {
            // Check each page to see if it has subpages
            for (const icon of iconData) {
              // Only check pages with paths
              if (icon.path) {
                const { count, error: countError } = await supabase
                  .from('custom_pages')
                  .select('id', { count: 'exact', head: true })
                  .eq('parent_path', icon.path)
                  .eq('published', true);
                
                if (!countError && count !== null) {
                  if (count > 0) {
                    // This page has children, mark it as a parent
                    console.log(`Page ${icon.path} has ${count} children, marking as parent`);
                    icon.is_parent = true;
                  }
                }
              }
            }
            
            // Update state with parent information
            setRootPages([...iconData]);
          }
        }
      } catch (error) {
        console.error("Error loading main pages:", error);
        setError("Error loading menu. Try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRootPages();
  }, [refreshTrigger]);
  
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
