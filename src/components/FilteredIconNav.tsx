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

  const fetchIcons = useCallback(async () => {
    try {
      console.log("Caricando icone per parent_path:", parentPath);
      
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIcons = localStorage.getItem(cacheKey);
      
      if (cachedIcons) {
        try {
          const parsedIcons = JSON.parse(cachedIcons);
          console.log("Utilizzando icone in cache:", parsedIcons.length);
          setIcons(parsedIcons);
        } catch (err) {
          console.error("Errore nel parsing delle icone dalla cache:", err);
        }
      }
      
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath);
      
      if (error) {
        console.error("Errore caricamento icone:", error);
        setHasConnectionError(true);
        throw error;
      }
      
      setHasConnectionError(false);
      
      if (!data || data.length === 0) {
        console.log("Nessuna icona trovata per parent_path:", parentPath);
        setIcons([]);
        return data || [];
      }
      
      console.log("Icone caricate dal server:", data.length);
      
      localStorage.setItem(cacheKey, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error("Errore nel caricamento delle icone:", error);
      return [];
    }
  }, [parentPath]);

  const removeDuplicates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Checking for duplicate menu items with parent_path:", parentPath);
      
      const data = await fetchIcons();
      
      if (!data || data.length === 0) {
        console.log("No menu items found for parent_path:", parentPath);
        setIsLoading(false);
        
        if (hasConnectionError && icons.length > 0) {
          console.log("Using cached icons due to connection error");
          return;
        }
        
        if (hasConnectionError) {
          setError("Impossibile connettersi al database. Controlla la tua connessione e riprova.");
          return;
        }
        
        return;
      }
      
      setIcons(data);
      
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

  useEffect(() => {
    removeDuplicates();
  }, [removeDuplicates, refreshTrigger]);

  const handleRefresh = () => {
    setError(null);
    if (onRefresh) {
      onRefresh();
    } else {
      setIsLoading(true);
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
