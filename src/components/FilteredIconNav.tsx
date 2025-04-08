
import React, { useEffect, useState, useCallback } from "react";
import IconNav from "./IconNav";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { toast } from "sonner";

interface FilteredIconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

interface IconData {
  id: string;
  path: string;
  label: string;
  icon: string;
  parent_path: string | null;
}

const FilteredIconNav: React.FC<FilteredIconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  refreshTrigger = 0 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Function to fetch published pages and convert them to icons format
  const loadPublishedPagesAsIcons = useCallback(async () => {
    try {
      console.log("Loading published pages for parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path')
        .eq('published', true)
        .eq('parent_path', parentPath);
        
      if (error) {
        console.error("Error loading published pages:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No published pages found for parent_path:", parentPath);
        return [];
      }
      
      // Convert pages to icons format
      const iconData = data.map(page => ({
        id: page.id,
        path: page.path,
        label: page.title,
        icon: page.icon || 'FileText',
        parent_path: page.parent_path
      }));
      
      console.log(`Found ${iconData.length} published pages to display as menu items`);
      
      // Save to cache for quick loading next time
      const cacheKey = `icons_${parentPath || 'root'}`;
      localStorage.setItem(cacheKey, JSON.stringify(iconData));
      
      return iconData;
    } catch (err) {
      console.error("Error in loadPublishedPagesAsIcons:", err);
      return [];
    }
  }, [parentPath]);
  
  // Main function to load icons from either menu_icons or published pages
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Try to use cache first for immediate display
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIconsStr = localStorage.getItem(cacheKey);
      
      if (cachedIconsStr) {
        try {
          const cachedIcons = JSON.parse(cachedIconsStr);
          if (cachedIcons && cachedIcons.length > 0) {
            console.log(`Using ${cachedIcons.length} cached icons temporarily`);
            setIcons(cachedIcons);
          }
        } catch (err) {
          console.error("Error parsing cached icons:", err);
        }
      }
      
      // First try to get icons from menu_icons table
      console.log("Trying to load icons from menu_icons table");
      const { data: iconData, error: iconError } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath);
      
      if (iconError) {
        console.error("Error loading menu icons:", iconError);
        setHasConnectionError(true);
        // Continue to try published pages as fallback
      } else if (iconData && iconData.length > 0) {
        console.log(`Loaded ${iconData.length} icons from menu_icons table`);
        setIcons(iconData);
        localStorage.setItem(cacheKey, JSON.stringify(iconData));
        setIsLoading(false);
        return;
      } else {
        console.log("No icons found in menu_icons table, trying published pages");
      }
      
      // If no icons or error, try to load published pages as icons
      const pageIcons = await loadPublishedPagesAsIcons();
      
      if (pageIcons.length > 0) {
        console.log(`Using ${pageIcons.length} published pages as menu items`);
        setIcons(pageIcons);
        setIsLoading(false);
        return;
      }
      
      // If we got here, we have no icons or pages to display
      console.log("No icons or published pages found for this menu");
      setIcons([]);
      
      if (hasConnectionError) {
        setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
      }
      
    } catch (error) {
      console.error("Error in loadIcons:", error);
      setHasConnectionError(true);
      setError("Errore nel caricamento del menu. Riprova più tardi.");
      
      // Try to use cached icons as last resort
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIconsStr = localStorage.getItem(cacheKey);
      if (cachedIconsStr) {
        try {
          const cachedIcons = JSON.parse(cachedIconsStr);
          if (cachedIcons && cachedIcons.length > 0) {
            console.log(`Using ${cachedIcons.length} cached icons as fallback after error`);
            setIcons(cachedIcons);
          }
        } catch (err) {
          console.error("Error parsing cached icons for fallback:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, hasConnectionError, loadPublishedPagesAsIcons]);

  // Load icons when component mounts or refreshTrigger changes
  useEffect(() => {
    console.log(`FilteredIconNav - Loading icons with refreshTrigger: ${refreshTrigger}`);
    loadIcons();
  }, [loadIcons, refreshTrigger]);
  
  // Try to reconnect if there's a connection error
  useEffect(() => {
    if (hasConnectionError && retryCount < 3) {
      const retryTime = 3000 * (retryCount + 1); // 3s, 6s, 9s
      console.log(`Will retry connection in ${retryTime/1000}s (attempt ${retryCount + 1})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadIcons();
      }, retryTime);
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionError, retryCount, loadIcons]);

  const handleRefresh = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    if (onRefresh) {
      onRefresh();
    } else {
      loadIcons();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">
            <TranslatedText text={error} />
          </p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <TranslatedText text="Riprova" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <IconNav 
      icons={icons}
      parentPath={parentPath} 
      onRefresh={handleRefresh} 
      refreshTrigger={refreshTrigger} 
    />
  );
};

export default FilteredIconNav;
