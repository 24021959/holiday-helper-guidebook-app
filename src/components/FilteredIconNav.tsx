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

  // Function to remove duplicate menu items
  const removeDuplicates = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get all icons
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return;
      
      // Find duplicate paths
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
      
      // Find paths with duplicates
      const duplicatePaths: string[] = [];
      const idsToDelete: string[] = [];
      
      pathsMap.forEach((items, path) => {
        if (items.length > 1) {
          duplicatePaths.push(path);
          
          // Keep the first one, delete the rest
          const itemsToDelete = items.slice(1);
          itemsToDelete.forEach(item => idsToDelete.push(item.id));
        }
      });
      
      // Delete duplicates if found
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
    removeDuplicates().then(() => {
      console.log("Completed duplicate check");
    });
  }, [removeDuplicates, refreshTrigger]);

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
