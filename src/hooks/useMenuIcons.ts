
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

  // Funzione per sincronizzare forzatamente tra pagine e menu
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

  // Funzione per caricare le pagine pubblicate come icone
  const loadPublishedPagesAsIcons = useCallback(async () => {
    try {
      console.log("Caricamento pagine pubblicate per parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path')
        .eq('published', true)
        .eq('parent_path', parentPath);
        
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
        icon: page.icon || 'FileText',
        parent_path: page.parent_path
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
  
  // Funzione per caricare le icone del menu dalla tabella menu_icons
  const loadMenuIcons = useCallback(async () => {
    try {
      console.log("Caricamento icone menu per parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      if (error) {
        console.error("Errore caricamento icone menu:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("Nessuna icona menu trovata per parent_path:", parentPath);
        return [];
      }
      
      console.log(`Trovate ${data.length} icone menu da mostrare`);
      return data;
    } catch (err) {
      console.error("Errore in loadMenuIcons:", err);
      return [];
    }
  }, [parentPath]);

  // Sincronizza custom_pages con menu_icons
  const syncPagesToMenuIcons = async (pageIcons: IconData[]) => {
    try {
      console.log("Sincronizzazione pagine con menu_icons...");
      
      // Ottieni icone menu esistenti per evitare duplicati
      const { data: existingIcons, error: fetchError } = await supabase
        .from('menu_icons')
        .select('path');
        
      if (fetchError) {
        console.error("Errore recupero icone menu esistenti:", fetchError);
        return;
      }
      
      // Crea un set di percorsi esistenti per ricerca rapida
      const existingPaths = new Set(existingIcons?.map(icon => icon.path) || []);
      
      // Trova icone pagina che non hanno corrispondenti icone menu
      const iconsToCreate = pageIcons.filter(icon => !existingPaths.has(icon.path));
      
      if (iconsToCreate.length === 0) {
        console.log("Nessuna nuova icona da sincronizzare");
        return;
      }
      
      console.log(`Trovate ${iconsToCreate.length} pagine senza icone menu, creazione in corso...`);
      
      // Formatta le icone per inserimento in menu_icons
      const newMenuIcons = iconsToCreate.map(icon => ({
        label: icon.label,
        path: icon.path,
        icon: icon.icon,
        bg_color: "bg-blue-200",
        is_submenu: icon.parent_path !== null,
        parent_path: icon.parent_path,
        published: true
      }));
      
      // Inserisci le nuove icone menu
      const { error: insertError } = await supabase
        .from('menu_icons')
        .insert(newMenuIcons);
        
      if (insertError) {
        console.error("Errore inserimento nuove icone menu:", insertError);
        return;
      }
      
      console.log(`Sincronizzate con successo ${newMenuIcons.length} pagine con menu_icons`);
      
    } catch (error) {
      console.error("Errore in syncPagesToMenuIcons:", error);
    }
  };

  // Funzione principale per caricare le icone
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Prima forza la sincronizzazione tra pagine e menu
      await syncPagesWithMenu();
      
      // Prova a usare cache per visualizzazione immediata
      const cacheKey = `icons_${parentPath || 'root'}`;
      const cachedIconsStr = localStorage.getItem(cacheKey);
      
      if (cachedIconsStr) {
        try {
          const cachedIcons = JSON.parse(cachedIconsStr);
          if (cachedIcons && cachedIcons.length > 0) {
            console.log(`Utilizzo ${cachedIcons.length} icone in cache temporaneamente`);
            setIcons(cachedIcons);
          }
        } catch (err) {
          console.error("Errore parsing icone in cache:", err);
        }
      }
      
      // Carica da entrambe le fonti
      const [menuIcons, pageIcons] = await Promise.all([
        loadMenuIcons(),
        loadPublishedPagesAsIcons()
      ]);
      
      // Combina icone da entrambe le fonti, usando Set per evitare duplicati per percorso
      const combinedIconsMap = new Map();
      
      // Aggiungi icone menu alla mappa
      menuIcons.forEach(icon => {
        combinedIconsMap.set(icon.path, icon);
      });
      
      // Aggiungi icone pagina alla mappa (sovrascriverà icone menu con stesso percorso)
      pageIcons.forEach(icon => {
        combinedIconsMap.set(icon.path, icon);
      });
      
      // Converti mappa in array
      const combinedIcons = Array.from(combinedIconsMap.values());
      
      console.log(`Icone combinate da entrambe le fonti: ${combinedIcons.length} totali`);
      
      // Ordina le icone per etichetta per visualizzazione coerente
      combinedIcons.sort((a, b) => {
        return (a.label || '').localeCompare(b.label || '');
      });
      
      setIcons(combinedIcons);
      
      // Salva icone combinate in cache
      localStorage.setItem(cacheKey, JSON.stringify(combinedIcons));
      
      // Fix: ricostruisci tabella menu_icons per assicurare che tutte le pagine abbiano icone
      if (combinedIcons.length > 0 && pageIcons.length > 0 && menuIcons.length !== pageIcons.length) {
        console.log("Rilevata discrepanza tra menu_icons e pagine, sincronizzazione...");
        syncPagesToMenuIcons(pageIcons);
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
  }, [parentPath, loadMenuIcons, loadPublishedPagesAsIcons, syncPagesWithMenu]);

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
    refreshIcons,
    syncPagesWithMenu
  };
};
