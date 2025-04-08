
import React, { useEffect, useState } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FilteredIconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

// Interfaccia per i dati delle icone
interface IconData {
  id: string;
  path: string;
  label: string;
  icon: string;
  parent_path: string | null;
  title?: string;
  is_parent?: boolean;
}

const FilteredIconNav: React.FC<FilteredIconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  refreshTrigger = 0 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);

  // Carica direttamente tutte le pagine dalla tabella custom_pages
  useEffect(() => {
    const loadPages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("FilteredIconNav - Caricamento pagine per parent_path:", parentPath);
        
        // Carica tutte le pagine dalla tabella custom_pages per il percorso padre corrente
        const { data: pages, error: pagesError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path')
          .eq('parent_path', parentPath);
          
        if (pagesError) {
          console.error("Errore nel caricamento delle pagine:", pagesError);
          throw pagesError;
        }
        
        if (!pages || pages.length === 0) {
          console.log("Nessuna pagina trovata per questo percorso padre");
          setIcons([]);
        } else {
          console.log(`Trovate ${pages.length} pagine`);
          
          // Converti le pagine in icone per il menu
          const iconData = pages.map(page => ({
            id: page.id,
            path: page.path,
            label: page.title,
            icon: page.icon || 'FileText',
            parent_path: page.parent_path,
            // Controlla se questa pagina è un genitore (ha sottopagine)
            is_parent: pages.some(p => p.parent_path === page.path)
          }));
          
          setIcons(iconData);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle icone:", error);
        setError("Errore nel caricamento del menu. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPages();
  }, [parentPath, refreshTrigger]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Ricarica manualmente
      setIsLoading(true);
      setError(null);
      
      // Forza ricaricamento della pagina
      setTimeout(() => {
        location.reload();
      }, 500);
    }
  };

  if (isLoading) {
    return <LoadingView message="Caricamento menu..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <IconNav 
      icons={icons}
      parentPath={parentPath} 
      onRefresh={handleRefresh}
    />
  );
};

export default FilteredIconNav;
