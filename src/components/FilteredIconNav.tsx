
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

  const fetchIcons = useCallback(async () => {
    try {
      console.log("Loading icons for parent_path:", parentPath);
      
      // First try to load from localStorage cache
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIconsStr = localStorage.getItem(cacheKey);
      
      if (cachedIconsStr) {
        try {
          const parsedIcons = JSON.parse(cachedIconsStr);
          console.log("Using cached icons temporarily:", parsedIcons.length);
          setIcons(parsedIcons);
        } catch (err) {
          console.error("Error parsing icons from cache:", err);
        }
      }
      
      // Always attempt to get fresh data from server
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath);
      
      if (error) {
        console.error("Error loading icons:", error);
        setHasConnectionError(true);
        throw error;
      }
      
      setHasConnectionError(false);
      
      if (!data || data.length === 0) {
        console.log("No icons found for parent_path:", parentPath);
        setIcons([]);
        return [];
      }
      
      console.log("Icons loaded from server:", data.length);
      
      // Update the cache with fresh data
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setIcons(data);
      
      return data;
    } catch (error) {
      console.error("Error loading icons:", error);
      
      // If we don't have any icons loaded yet, try to use cached icons as fallback
      if (icons.length === 0) {
        const cacheKey = `icons_${parentPath || 'root'}`;
        const cachedIconsStr = localStorage.getItem(cacheKey);
        
        if (cachedIconsStr) {
          try {
            const parsedIcons = JSON.parse(cachedIconsStr);
            setIcons(parsedIcons);
            console.log("Using cached icons as fallback after fetch error:", parsedIcons.length);
          } catch (err) {
            console.error("Error parsing icons from cache as fallback:", err);
          }
        }
      }
      
      return [];
    }
  }, [parentPath, icons.length]);

  const removeDuplicates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Checking for duplicate menu items with parent_path:", parentPath);
      
      const data = await fetchIcons();
      
      if (!data || data.length === 0) {
        console.log("No menu items found for parent_path:", parentPath);
        
        if (hasConnectionError && icons.length > 0) {
          console.log("Using cached icons due to connection error");
          setIsLoading(false);
          return;
        }
        
        if (hasConnectionError) {
          setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);
        return;
      }
      
      // If we reached this point, we have loaded icons successfully
      setIcons(data);
      
      // Check for and remove duplicates
      const pathsMap = new Map<string, IconData[]>();
      
      data.forEach((icon) => {
        const iconData = {
          id: icon.id,
          path: icon.path,
          label: icon.label,
          icon: icon.icon,
          parent_path: icon.parent_path
        };
        
        if (!pathsMap.has(icon.path)) {
          pathsMap.set(icon.path, [iconData]);
        } else {
          pathsMap.get(icon.path)?.push(iconData);
        }
      });
      
      const duplicatePaths: string[] = [];
      const idsToDelete: string[] = [];
      
      pathsMap.forEach((items, path) => {
        if (items.length > 1) {
          duplicatePaths.push(path);
          
          const itemsToDelete = items.slice(1);
          itemsToDelete.forEach(item => idsToDelete.push(item.id));
        }
      });
      
      if (idsToDelete.length > 0) {
        console.log("Found duplicate menu items to delete:", idsToDelete.length);
        
        for (const id of idsToDelete) {
          const { error: deleteError } = await supabase
            .from('menu_icons')
            .delete()
            .eq('id', id);
          
          if (deleteError) {
            console.error("Error deleting duplicate:", deleteError);
          }
        }
        
        const storiaIconIds = data
          .filter(icon => icon.path === "/storia-della-locanda" || icon.label.toLowerCase().includes("storia della locanda"))
          .map(icon => icon.id);
        
        if (storiaIconIds.length > 1) {
          for (let i = 1; i < storiaIconIds.length; i++) {
            await supabase
              .from('menu_icons')
              .delete()
              .eq('id', storiaIconIds[i]);
          }
          
          toast.success(`Rimossa pagina "Storia della locanda" duplicata`);
        }
        
        toast.success(`Rimossi ${idsToDelete.length} elementi duplicati dal menu`);
        
        // Reload icons after removing duplicates
        await fetchIcons();
      } else {
        console.log("No duplicate menu items found");
      }
    } catch (error) {
      console.error("Error removing duplicates:", error);
      if (icons.length === 0) {
        setError("Errore nel caricamento delle icone. Riprova più tardi.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, fetchIcons, icons, hasConnectionError]);

  // Try to reconnect if there's a connection error
  useEffect(() => {
    if (hasConnectionError && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retry attempt ${retryCount + 1} for loading icons...`);
        setRetryCount(prev => prev + 1);
        removeDuplicates();
      }, 3000 * (retryCount + 1)); // Exponential backoff: 3s, 6s, 9s
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionError, retryCount, removeDuplicates]);

  // Load icons when component mounts or when refreshTrigger changes
  useEffect(() => {
    console.log("FilteredIconNav - loading icons, refreshTrigger:", refreshTrigger);
    setRetryCount(0);
    removeDuplicates();
  }, [removeDuplicates, refreshTrigger]);

  const handleRefresh = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    if (onRefresh) {
      onRefresh();
    } else {
      removeDuplicates();
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
      onRefresh={onRefresh || handleRefresh} 
      refreshTrigger={refreshTrigger} 
    />
  );
};

export default FilteredIconNav;
