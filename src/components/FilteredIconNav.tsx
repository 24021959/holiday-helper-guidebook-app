
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

  // Funzione per forzare la sincronizzazione tra pagine e menu
  const syncPagesWithMenu = useCallback(async () => {
    try {
      console.log("Sincronizzazione forzata tra pagine e menu...");
      
      // Step 1: Ottieni tutte le pagine pubblicate
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path')
        .eq('published', true)
        .eq('parent_path', parentPath);
        
      if (pagesError) {
        console.error("Errore nel recupero delle pagine:", pagesError);
        throw pagesError;
      }
      
      if (!pages || pages.length === 0) {
        console.log("Nessuna pagina pubblicata trovata per il percorso:", parentPath);
        return [];
      }
      
      // Step 2: Ottieni tutte le icone del menu esistenti
      const { data: menuIcons, error: iconsError } = await supabase
        .from('menu_icons')
        .select('path')
        .eq('parent_path', parentPath);
        
      if (iconsError) {
        console.error("Errore nel recupero delle icone del menu:", iconsError);
        throw iconsError;
      }
      
      // Crea un set con i percorsi delle icone esistenti
      const existingPaths = new Set(menuIcons?.map(icon => icon.path) || []);
      
      // Step 3: Trova le pagine che non hanno un'icona nel menu
      const pagesToSync = pages.filter(page => !existingPaths.has(page.path));
      
      if (pagesToSync.length > 0) {
        console.log(`Trovate ${pagesToSync.length} pagine da sincronizzare con il menu`);
        
        // Step 4: Crea nuove icone nel menu per le pagine mancanti
        const newMenuIcons = pagesToSync.map(page => ({
          label: page.title,
          path: page.path,
          icon: page.icon || 'FileText',
          bg_color: "bg-blue-200",
          is_submenu: page.parent_path !== null,
          parent_path: page.parent_path,
          published: true
        }));
        
        // Inserisci le nuove icone nel menu
        const { error: insertError } = await supabase
          .from('menu_icons')
          .insert(newMenuIcons);
          
        if (insertError) {
          console.error("Errore nell'inserimento delle nuove icone:", insertError);
          throw insertError;
        }
        
        console.log(`Sincronizzate con successo ${newMenuIcons.length} pagine nel menu`);
        toast.success(`${newMenuIcons.length} pagine aggiunte al menu`);
      }
      
      // Step 5: Converti tutte le pagine in formato icona per il rendering
      const iconData = pages.map(page => ({
        id: page.id,
        path: page.path,
        label: page.title,
        icon: page.icon || 'FileText',
        parent_path: page.parent_path
      }));
      
      console.log(`Preparate ${iconData.length} icone dalle pagine pubblicate`);
      
      // Salva in cache
      const cacheKey = `icons_${parentPath || 'root'}`;
      localStorage.setItem(cacheKey, JSON.stringify(iconData));
      
      return iconData;
    } catch (err) {
      console.error("Errore nella sincronizzazione pagine-menu:", err);
      return [];
    }
  }, [parentPath]);

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
  
  // Function to fetch menu icons from menu_icons table
  const loadMenuIcons = useCallback(async () => {
    try {
      console.log("Loading menu icons for parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      if (error) {
        console.error("Error loading menu icons:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No menu icons found for parent_path:", parentPath);
        return [];
      }
      
      console.log(`Found ${data.length} menu icons to display`);
      return data;
    } catch (err) {
      console.error("Error in loadMenuIcons:", err);
      return [];
    }
  }, [parentPath]);
  
  // Main function to load icons from both menu_icons and published pages
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Prima forza la sincronizzazione tra pagine e menu
      await syncPagesWithMenu();
      
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
      
      // Load from both sources
      const [menuIcons, pageIcons] = await Promise.all([
        loadMenuIcons(),
        loadPublishedPagesAsIcons()
      ]);
      
      // Combine icons from both sources, using Set to avoid duplicates by path
      const combinedIconsMap = new Map();
      
      // Add menu icons to the map
      menuIcons.forEach(icon => {
        combinedIconsMap.set(icon.path, icon);
      });
      
      // Add page icons to the map (will overwrite menu icons with same path)
      pageIcons.forEach(icon => {
        combinedIconsMap.set(icon.path, icon);
      });
      
      // Convert map back to array
      const combinedIcons = Array.from(combinedIconsMap.values());
      
      console.log(`Combined icons from both sources: ${combinedIcons.length} total`);
      
      // Sort the icons by label for consistent display
      combinedIcons.sort((a, b) => {
        return (a.label || '').localeCompare(b.label || '');
      });
      
      setIcons(combinedIcons);
      
      // Save combined icons to cache
      localStorage.setItem(cacheKey, JSON.stringify(combinedIcons));
      
      // Fix: rebuild menu_icons table to ensure all pages have icons
      if (combinedIcons.length > 0 && pageIcons.length > 0 && menuIcons.length !== pageIcons.length) {
        console.log("Detected mismatch between menu_icons and pages, syncing...");
        syncPagesToMenuIcons(pageIcons);
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
  }, [parentPath, loadMenuIcons, loadPublishedPagesAsIcons, syncPagesWithMenu]);

  // Function to sync custom_pages to menu_icons
  const syncPagesToMenuIcons = async (pageIcons: IconData[]) => {
    try {
      console.log("Syncing pages to menu_icons...");
      
      // Get existing menu icons to avoid duplicates
      const { data: existingIcons, error: fetchError } = await supabase
        .from('menu_icons')
        .select('path');
        
      if (fetchError) {
        console.error("Error fetching existing menu icons:", fetchError);
        return;
      }
      
      // Create a set of existing paths for quick lookup
      const existingPaths = new Set(existingIcons?.map(icon => icon.path) || []);
      
      // Find page icons that don't have corresponding menu icons
      const iconsToCreate = pageIcons.filter(icon => !existingPaths.has(icon.path));
      
      if (iconsToCreate.length === 0) {
        console.log("No new icons to sync");
        return;
      }
      
      console.log(`Found ${iconsToCreate.length} pages without menu icons, creating...`);
      
      // Format the icons for insertion into menu_icons
      const newMenuIcons = iconsToCreate.map(icon => ({
        label: icon.label,
        path: icon.path,
        icon: icon.icon,
        bg_color: "bg-blue-200",
        is_submenu: icon.parent_path !== null,
        parent_path: icon.parent_path,
        published: true
      }));
      
      // Insert the new menu icons
      const { error: insertError } = await supabase
        .from('menu_icons')
        .insert(newMenuIcons);
        
      if (insertError) {
        console.error("Error inserting new menu icons:", insertError);
        return;
      }
      
      console.log(`Successfully synced ${newMenuIcons.length} pages to menu_icons`);
      
    } catch (error) {
      console.error("Error in syncPagesToMenuIcons:", error);
    }
  };

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
