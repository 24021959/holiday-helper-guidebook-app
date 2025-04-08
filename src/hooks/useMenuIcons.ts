
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
  
  console.log(`useMenuIcons initialized with parentPath: ${parentPath}`);

  // Main function to load icons
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Be careful with localStorage and handle quota errors
      try {
        const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger}`;
        localStorage.removeItem(cacheKey);
      } catch (e) {
        console.warn("Could not access localStorage, continuing without cache:", e);
      }
      
      console.log(`Loading icons for parentPath: ${parentPath}, refreshTrigger: ${refreshTrigger}`);

      // LOAD TOP LEVEL PAGES OR SUBPAGES
      let pageIcons: IconData[] = [];
      
      if (parentPath === null) {
        // We're in the root menu - load main pages (parent_path === null)
        console.log("Loading root level pages");
        const { data: rootPages, error: rootError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path, published')
          .is('parent_path', null)
          .eq('published', true);
          
        if (rootError) {
          console.error("Error loading root pages:", rootError);
          throw rootError;
        } else if (rootPages && rootPages.length > 0) {
          console.log(`Found ${rootPages.length} published root pages:`, rootPages);
          
          pageIcons = rootPages.map(page => ({
            id: page.id,
            path: page.path,
            label: page.title,
            title: page.title,
            icon: page.icon || 'FileText',
            parent_path: page.parent_path,
            published: page.published,
            is_parent: false // Default value, will be updated later
          }));
        } else {
          console.log("No root pages found");
        }
      } else {
        // We're in a submenu - load subpages for the specific parent path
        console.log(`Loading subpages for parent path: ${parentPath}`);
        const { data: subPages, error: subPagesError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path, published')
          .eq('parent_path', parentPath)
          .eq('published', true);
          
        if (subPagesError) {
          console.error("Error loading subpages:", subPagesError);
          throw subPagesError;
        } else if (subPages && subPages.length > 0) {
          console.log(`Found ${subPages.length} published subpages for ${parentPath}:`, subPages);
          
          pageIcons = subPages.map(page => ({
            id: page.id,
            path: page.path,
            label: page.title,
            title: page.title,
            icon: page.icon || 'FileText',
            parent_path: page.parent_path,
            published: page.published,
            is_parent: false // Default value, will be updated later
          }));
        } else {
          console.log(`No subpages found for parent path: ${parentPath}`);
        }
      }
      
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
        
        // Carefully handle localStorage to avoid quota errors
        try {
          const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger}`;
          const iconString = JSON.stringify(uniqueIcons);
          
          // Only store if small enough to avoid quota issues
          if (iconString.length < 500000) { // ~500KB limit to be safe
            localStorage.setItem(cacheKey, iconString);
          } else {
            console.warn("Icons data too large for localStorage, skipping cache");
          }
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }
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
          
          // Safely store in localStorage
          try {
            const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger}`;
            const iconString = JSON.stringify(iconData);
            
            if (iconString.length < 500000) {
              localStorage.setItem(cacheKey, iconString);
            }
          } catch (e) {
            console.warn("Could not save icons to localStorage:", e);
          }
        } else {
          console.log("No menu icons found either, the menu will be empty.");
          setIcons([]);
        }
      }
    } catch (error) {
      console.error("Error in loadIcons:", error);
      setHasConnectionError(true);
      setError("Error loading menu. Try again later.");
      
      // Try to use cached icons as a last resort, but handle localStorage errors
      try {
        const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger-1}`;
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
      } catch (e) {
        console.warn("Could not access localStorage for fallback:", e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, refreshTrigger]);

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
    
    // Clear cache to force fresh data
    try {
      const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger}`;
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.warn("Could not clear localStorage cache:", e);
    }
    
    loadIcons();
  };

  return {
    icons,
    isLoading,
    error,
    refreshIcons
  };
};
