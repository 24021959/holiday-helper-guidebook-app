
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
  bg_color?: string;
  published?: boolean;
}

const FilteredIconNav: React.FC<FilteredIconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  refreshTrigger = 0 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);

  // Carica le icone direttamente dalle pagine pubblicate
  useEffect(() => {
    const loadIcons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("FilteredIconNav - Caricamento pagine pubblicate...");
        
        // Carica direttamente dalle pagine pubblicate
        const { data: pages, error: pagesError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path')
          .eq('published', true)
          .eq('parent_path', parentPath);
          
        if (pagesError) {
          console.error("Errore nel caricamento delle pagine:", pagesError);
          throw pagesError;
        }
        
        if (!pages || pages.length === 0) {
          console.log("Nessuna pagina pubblicata trovata");
          
          // Controlla anche in menu_icons come fallback
          console.log("Controllo in menu_icons...");
          const { data: menuIcons, error: menuError } = await supabase
            .from('menu_icons')
            .select('*')
            .eq('parent_path', parentPath)
            .eq('published', true);
            
          if (menuError) {
            console.error("Errore nel caricamento delle icone menu:", menuError);
            throw menuError;
          }
          
          if (menuIcons && menuIcons.length > 0) {
            console.log(`Trovate ${menuIcons.length} icone nel menu`);
            setIcons(menuIcons);
          } else {
            console.log("Nessuna icona trovata nel menu");
            // Prova a sincronizzare pagine con menu
            await syncPagesToMenu();
          }
        } else {
          console.log(`Trovate ${pages.length} pagine pubblicate`);
          
          // Converti le pagine in icone
          const iconData = pages.map(page => ({
            id: page.id,
            path: page.path,
            label: page.title,
            icon: page.icon || 'FileText',
            parent_path: page.parent_path
          }));
          
          setIcons(iconData);
          
          // Verifica se le pagine sono sincronizzate con il menu
          console.log("Verifica sincronizzazione con menu_icons...");
          await syncPagesToMenu(iconData);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle icone:", error);
        setError("Errore nel caricamento del menu. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIcons();
  }, [parentPath, refreshTrigger]);
  
  // Sincronizza le pagine con le icone del menu
  const syncPagesToMenu = async (pageIcons?: IconData[]) => {
    try {
      console.log("Sincronizzazione pagine con menu...");
      
      // Se non abbiamo icone da pagine, carichiamole
      if (!pageIcons) {
        const { data: pages, error: pagesError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path')
          .eq('published', true);
          
        if (pagesError) {
          console.error("Errore nel caricamento delle pagine:", pagesError);
          return;
        }
        
        if (!pages || pages.length === 0) {
          console.log("Nessuna pagina pubblicata trovata da sincronizzare");
          return;
        }
        
        pageIcons = pages.map(page => ({
          id: page.id,
          path: page.path,
          label: page.title,
          icon: page.icon || 'FileText',
          parent_path: page.parent_path
        }));
      }
      
      // Ottieni le icone menu esistenti
      const { data: menuIcons, error: menuError } = await supabase
        .from('menu_icons')
        .select('path');
        
      if (menuError) {
        console.error("Errore nel caricamento delle icone menu:", menuError);
        return;
      }
      
      // Crea un set di percorsi esistenti
      const existingPaths = new Set(menuIcons?.map(icon => icon.path) || []);
      
      // Trova pagine che non hanno icone nel menu
      const iconsToCreate = pageIcons.filter(icon => !existingPaths.has(icon.path));
      
      if (iconsToCreate.length === 0) {
        console.log("Tutte le pagine sono già sincronizzate con il menu");
        return;
      }
      
      console.log(`Trovate ${iconsToCreate.length} pagine da sincronizzare con il menu`);
      
      // Prepara i dati per le nuove icone menu
      const newMenuIcons = iconsToCreate.map(icon => ({
        label: icon.label,
        path: icon.path,
        icon: icon.icon,
        bg_color: "bg-blue-200",
        is_submenu: icon.parent_path !== null,
        parent_path: icon.parent_path,
        published: true  // Imposta a true di default
      }));
      
      // Inserisci le nuove icone con ritardi tra i tentativi
      for (const icon of newMenuIcons) {
        try {
          const { error: insertError } = await supabase
            .from('menu_icons')
            .insert(icon);
            
          if (insertError) {
            console.error(`Errore nell'inserimento dell'icona ${icon.path}:`, insertError);
            
            // Attendi un po' e riprova
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { error: retryError } = await supabase
              .from('menu_icons')
              .insert(icon);
              
            if (retryError) {
              console.error(`Anche il secondo tentativo per ${icon.path} è fallito:`, retryError);
            } else {
              console.log(`Icona ${icon.path} inserita con successo al secondo tentativo`);
            }
          } else {
            console.log(`Icona ${icon.path} inserita con successo`);
          }
        } catch (e) {
          console.error(`Errore non gestito per l'icona ${icon.path}:`, e);
        }
      }
      
      console.log("Sincronizzazione completata");
      toast.success(`${newMenuIcons.length} pagine sincronizzate con il menu`);
      
      // Recarica le icone per mostrare i cambiamenti
      const { data: updatedIcons } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      if (updatedIcons && updatedIcons.length > 0) {
        console.log(`Caricate ${updatedIcons.length} icone aggiornate dal menu`);
        setIcons(updatedIcons);
      }
    } catch (error) {
      console.error("Errore nella sincronizzazione:", error);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Ricarica manualmente
      setIsLoading(true);
      setError(null);
      
      // Forza la sincronizzazione e poi ricarica le icone
      syncPagesToMenu().then(() => {
        setTimeout(() => {
          location.reload(); // Forza ricaricamento della pagina
        }, 1000);
      });
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
