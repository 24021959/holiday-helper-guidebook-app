
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IconData {
  id: string;
  path: string;
  label: string;
  title?: string;
  icon: string;
  parent_path: string | null;
  published?: boolean;
  is_parent?: boolean;  // Property for parent icon identification
  bg_color?: string;
}

interface UseMenuIconsProps {
  parentPath: string | null;
  refreshTrigger?: number;
}

export const useMenuIcons = ({ parentPath, refreshTrigger = 0 }: UseMenuIconsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Function to load published pages as icons
  const loadPublishedPagesAsIcons = useCallback(async () => {
    try {
      console.log("Loading published pages for parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      if (error) {
        console.error("Error loading published pages:", error);
        throw error;
      }
      
      console.log("Received data from custom_pages:", data);
      
      if (!data || data.length === 0) {
        console.log("No published pages found for parent_path:", parentPath);
        return [];
      }
      
      // Convert pages to icon format
      const iconData = data.map(page => ({
        id: page.id,
        path: page.path,
        label: page.title,
        title: page.title,
        icon: page.icon || 'FileText',
        parent_path: page.parent_path,
        published: page.published,
        is_parent: false // Default value, will be updated later if it's a parent
      }));
      
      console.log(`Found ${iconData.length} published pages to show as menu items`);
      
      // Save to cache for quick loading next time
      const cacheKey = `icons_${parentPath || 'root'}`;
      localStorage.setItem(cacheKey, JSON.stringify(iconData));
      
      return iconData;
    } catch (err) {
      console.error("Error in loadPublishedPagesAsIcons:", err);
      return [];
    }
  }, [parentPath]);
  
  // Main function to load icons
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Try to get from cache first for immediate display
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIconsStr = localStorage.getItem(cacheKey);
      let cachedIcons: IconData[] = [];
      
      if (cachedIconsStr) {
        try {
          cachedIcons = JSON.parse(cachedIconsStr);
          if (cachedIcons && cachedIcons.length > 0) {
            console.log(`Using ${cachedIcons.length} cached icons temporarily while loading fresh data`);
            setIcons(cachedIcons); // Set cached icons immediately for better UX
          }
        } catch (err) {
          console.error("Error parsing cached icons:", err);
        }
      }
      
      // Load icons from published pages
      const pageIcons = await loadPublishedPagesAsIcons();
      
      // Check for elements with children (parent pages)
      if (pageIcons.length > 0) {
        const updatedIcons = [...pageIcons];
        
        for (let i = 0; i < updatedIcons.length; i++) {
          const icon = updatedIcons[i];
          if (icon.path) {
            // Check if there are child pages to identify parent pages
            const { count, error: countError } = await supabase
              .from('custom_pages')
              .select('id', { count: 'exact', head: true })
              .eq('parent_path', icon.path)
              .eq('published', true);
            
            if (!countError && count !== null && count > 0) {
              console.log(`Page ${icon.path} has ${count} children, marked as parent`);
              updatedIcons[i] = { ...icon, is_parent: true };
            }
          }
        }
        
        // Remove any duplicates based on path
        const uniqueIcons = Array.from(
          new Map(updatedIcons.map(icon => [icon.path, icon])).values()
        );
        
        console.log(`Loaded ${uniqueIcons.length} unique icons`);
        setIcons(uniqueIcons);
        
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(uniqueIcons));
      } else {
        console.log("No page icons found, checking for direct menu_icons");
        // Check if there are any direct menu_icons for this parent
        const { data: menuIconsData, error: menuIconsError } = await supabase
          .from('menu_icons')
          .select('*')
          .eq('parent_path', parentPath)
          .eq('published', true);
        
        if (!menuIconsError && menuIconsData && menuIconsData.length > 0) {
          console.log(`Found ${menuIconsData.length} menu icons for parent_path:`, parentPath);
          
          const iconData = menuIconsData.map(icon => ({
            id: icon.id,
            path: icon.path,
            label: icon.label,
            title: icon.label,
            icon: icon.icon,
            parent_path: icon.parent_path,
            bg_color: icon.bg_color,
            published: icon.published,
            is_parent: false // Default to false, we'll check below
          }));
          
          // Check which ones are parents
          for (let i = 0; i < iconData.length; i++) {
            const icon = iconData[i];
            if (icon.path) {
              const { count, error: countError } = await supabase
                .from('custom_pages')
                .select('id', { count: 'exact', head: true })
                .eq('parent_path', icon.path)
                .eq('published', true);
              
              if (!countError && count !== null && count > 0) {
                console.log(`Icon ${icon.path} has ${count} children, marked as parent`);
                iconData[i] = { ...icon, is_parent: true };
              }
            }
          }
          
          setIcons(iconData);
          localStorage.setItem(cacheKey, JSON.stringify(iconData));
        } else {
          console.log("No menu icons found either, the menu will be empty.");
          
          // Debugging code to check for any published pages
          const { data: allPages, error: allPagesError } = await supabase
            .from('custom_pages')
            .select('id, title, path, parent_path, published');
          
          if (!allPagesError && allPages) {
            console.log("All pages in database:", allPages);
            console.log("Published pages:", allPages.filter(p => p.published));
            console.log("Pages with current parent_path:", allPages.filter(p => p.parent_path === parentPath));
          }
          
          setIcons([]);
        }
      }
    } catch (error) {
      console.error("Error in loadIcons:", error);
      setHasConnectionError(true);
      setError("Errore nel caricamento del menu. Riprova più tardi.");
      
      // Try to use cached icons as a last resort
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
  }, [parentPath, loadPublishedPagesAsIcons]);

  // Load icons when component mounts or refreshTrigger changes
  useEffect(() => {
    console.log(`useMenuIcons - Loading icons with refreshTrigger: ${refreshTrigger}`);
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

  // Function to manually refresh the data
  const refreshIcons = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    loadIcons();
  };

  return {
    icons,
    isLoading,
    error,
    refreshIcons
  };
};
