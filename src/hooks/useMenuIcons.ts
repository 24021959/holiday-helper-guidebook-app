
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IconData {
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

  // Funzione per caricare le pagine pubblicate come icone
  const loadPublishedPagesAsIcons = useCallback(async () => {
    try {
      console.log("Caricamento pagine pubblicate per parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      if (error) {
        console.error("Errore caricamento pagine pubblicate:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("Nessuna pagina pubblicata trovata per parent_path:", parentPath);
        return [];
      }
      
      // Converti pagine in formato icone
      const iconData = data.map(page => ({
        id: page.id,
        path: page.path,
        label: page.title,
        title: page.title,
        icon: page.icon || 'FileText',
        parent_path: page.parent_path,
        published: page.published
      }));
      
      console.log(`Trovate ${iconData.length} pagine pubblicate da mostrare come elementi del menu`);
      
      // Salva in cache per caricamento rapido la prossima volta
      const cacheKey = `icons_${parentPath || 'root'}`;
      localStorage.setItem(cacheKey, JSON.stringify(iconData));
      
      return iconData;
    } catch (err) {
      console.error("Errore in loadPublishedPagesAsIcons:", err);
      return [];
    }
  }, [parentPath]);
  
  // Funzione principale per caricare le icone
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Carica icone dalle pagine pubblicate
      const pageIcons = await loadPublishedPagesAsIcons();
      
      // Verificare elementi con figli (pagine parent)
      if (pageIcons.length > 0) {
        const updatedIcons = [...pageIcons];
        
        for (let i = 0; i < updatedIcons.length; i++) {
          const icon = updatedIcons[i];
          if (icon.path) {
            // Controlla se ci sono pagine figlie per identificare le pagine parent
            const { count, error: countError } = await supabase
              .from('custom_pages')
              .select('id', { count: 'exact', head: true })
              .eq('parent_path', icon.path)
              .eq('published', true);
            
            if (!countError && count !== null && count > 0) {
              console.log(`Pagina ${icon.path} ha ${count} figli, contrassegnata come parent`);
              updatedIcons[i] = { ...icon, is_parent: true };
            }
          }
        }
        
        // Elimina eventuali duplicati basati sul percorso
        const uniqueIcons = Array.from(
          new Map(updatedIcons.map(icon => [icon.path, icon])).values()
        );
        
        console.log(`Caricate ${uniqueIcons.length} icone uniche`);
        setIcons(uniqueIcons);
        
        // Salva in cache
        const cacheKey = `icons_${parentPath || 'root'}`;
        localStorage.setItem(cacheKey, JSON.stringify(uniqueIcons));
      } else {
        setIcons([]);
      }
    } catch (error) {
      console.error("Errore in loadIcons:", error);
      setHasConnectionError(true);
      setError("Errore nel caricamento del menu. Riprova più tardi.");
      
      // Prova a usare icone in cache come ultima risorsa
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIconsStr = localStorage.getItem(cacheKey);
      if (cachedIconsStr) {
        try {
          const cachedIcons = JSON.parse(cachedIconsStr);
          if (cachedIcons && cachedIcons.length > 0) {
            console.log(`Utilizzo ${cachedIcons.length} icone in cache come fallback dopo errore`);
            setIcons(cachedIcons);
          }
        } catch (err) {
          console.error("Errore parsing icone in cache per fallback:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, loadPublishedPagesAsIcons]);

  // Carica icone quando il componente viene montato o refreshTrigger cambia
  useEffect(() => {
    console.log(`useMenuIcons - Caricamento icone con refreshTrigger: ${refreshTrigger}`);
    loadIcons();
  }, [loadIcons, refreshTrigger]);
  
  // Prova a riconnettersi se c'è un errore di connessione
  useEffect(() => {
    if (hasConnectionError && retryCount < 3) {
      const retryTime = 3000 * (retryCount + 1); // 3s, 6s, 9s
      console.log(`Riproverà connessione in ${retryTime/1000}s (tentativo ${retryCount + 1})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadIcons();
      }, retryTime);
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionError, retryCount, loadIcons]);

  // Funzione per aggiornare manualmente i dati
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
