
import React, { useEffect, useState, useCallback } from "react";
import IconNav from "./IconNav";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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

  const removeDuplicates = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }
      
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
      }
    } catch (error) {
      console.error("Error removing duplicates:", error);
      setError("Errore nella rimozione dei duplicati");
    } finally {
      setIsLoading(false);
    }
  }, [parentPath]);

  useEffect(() => {
    removeDuplicates();
  }, [removeDuplicates, refreshTrigger]);

  useEffect(() => {
    const deleteStoriaDellaLocanda = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_icons')
          .select('*')
          .or('id.eq.bf7769fa-fc88-42bd-8be5-72b62f8e4841,id.eq.b3c7b3ec-4149-42b8-be78-1c17bc52229c');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const storiaEntries = data.filter(item => 
            item.path === "/storia-della-locanda" || 
            item.label.toLowerCase().includes("storia della locanda")
          );
          
          if (storiaEntries.length > 1) {
            for (let i = 1; i < storiaEntries.length; i++) {
              const { error: deleteError } = await supabase
                .from('menu_icons')
                .delete()
                .eq('id', storiaEntries[i].id);
              
              if (deleteError) {
                console.error("Error deleting specific Storia page:", deleteError);
              } else {
                console.log(`Deleted duplicate Storia della locanda with id: ${storiaEntries[i].id}`);
                toast.success("Pagina Storia della locanda duplicata rimossa correttamente");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error handling specific Storia della locanda deletion:", error);
      }
    };
    
    deleteStoriaDellaLocanda();
  }, []);

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
          <p className="text-red-500">
            <TranslatedText text={error} />
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <TranslatedText text="Riprova" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <IconNav 
      parentPath={parentPath} 
      onRefresh={onRefresh} 
      refreshTrigger={refreshTrigger} 
    />
  );
};

export default FilteredIconNav;
