
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";

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
  const { language } = useTranslation();
  
  console.log(`useMenuIcons initialized with parentPath: ${parentPath}, language: ${language}`);

  // Main function to load icons
  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      // Be careful with localStorage and handle quota errors
      try {
        const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
        localStorage.removeItem(cacheKey);
      } catch (e) {
        console.warn("Could not access localStorage, continuing without cache:", e);
      }
      
      console.log(`Loading icons for parentPath: ${parentPath}, language: ${language}, refreshTrigger: ${refreshTrigger}`);

      // LOAD TOP LEVEL PAGES OR SUBPAGES
      let pageIcons: IconData[] = [];
      
      // Gestione delle query in base alla lingua corrente e al path
      if (parentPath === null) {
        // Siamo nel menu principale - carica pagine principali 
        console.log(`Loading root level pages for language: ${language}`);
        
        if (language === 'it') {
          // Per l'italiano (default), carica pagine che non hanno prefisso lingua
          // e aggiungi anche la home page italiana
          const { data: rootPages, error: rootError } = await supabase
            .from('custom_pages')
            .select('id, title, path, icon, parent_path, published')
            .is('parent_path', null)
            .eq('published', true)
            .not('path', 'like', '/en/%')
            .not('path', 'like', '/fr/%')
            .not('path', 'like', '/es/%')
            .not('path', 'like', '/de/%');
            
          if (rootError) {
            console.error("Error loading root pages:", rootError);
            throw rootError;
          } else if (rootPages && rootPages.length > 0) {
            console.log(`Found ${rootPages.length} published root pages for IT:`, rootPages);
            
            // Filtra per escludere percorsi con prefissi lingua esatti come /en, /fr etc
            const filteredPages = rootPages.filter(page => {
              return !['/en', '/fr', '/es', '/de'].includes(page.path);
            });
            
            pageIcons = filteredPages.map(page => ({
              id: page.id,
              path: page.path,
              label: page.title,
              title: page.title,
              icon: page.icon || 'FileText',
              parent_path: page.parent_path,
              published: page.published,
              is_parent: false // Default value, will be updated later
            }));
            
            // Verifica se abbiamo la home italiana
            const hasHomePage = pageIcons.some(icon => icon.path === '/home');
            if (!hasHomePage) {
              // Carica la home page italiana se esiste
              const { data: homePage } = await supabase
                .from('custom_pages')
                .select('id, title, path, icon, parent_path, published')
                .eq('path', '/home')
                .eq('published', true)
                .maybeSingle();
                
              if (homePage) {
                pageIcons.push({
                  id: homePage.id,
                  path: homePage.path,
                  label: homePage.title,
                  title: homePage.title,
                  icon: homePage.icon || 'Home',
                  parent_path: homePage.parent_path,
                  published: homePage.published,
                  is_parent: false
                });
              }
            }
          } else {
            console.log("No root pages found for IT");
          }
        } else {
          // Per altre lingue, carica solo pagine con prefisso lingua
          console.log(`Loading only pages with language prefix /${language}/ or exactly /${language}`);
          
          // Carica home page per questa lingua (percorso esatto /${language})
          const { data: langHomePage } = await supabase
            .from('custom_pages')
            .select('id, title, path, icon, parent_path, published')
            .eq('path', `/${language}`)
            .eq('published', true)
            .maybeSingle();
            
          if (langHomePage) {
            console.log(`Found home page for ${language}:`, langHomePage);
            
            pageIcons.push({
              id: langHomePage.id,
              path: langHomePage.path,
              label: langHomePage.title,
              title: langHomePage.title,
              icon: langHomePage.icon || 'Home',
              parent_path: langHomePage.parent_path,
              published: langHomePage.published,
              is_parent: false
            });
          }
          
          // Carica altre pagine root per questa lingua
          const { data: langPages, error: langError } = await supabase
            .from('custom_pages')
            .select('id, title, path, icon, parent_path, published')
            .is('parent_path', null)
            .eq('published', true)
            .like('path', `/${language}/%`);
            
          if (langError) {
            console.error(`Error loading root pages for language ${language}:`, langError);
            throw langError;
          } else if (langPages && langPages.length > 0) {
            console.log(`Found ${langPages.length} published root pages for ${language}:`, langPages);
            
            // Aggiungi altre pagine root
            langPages.forEach(page => {
              pageIcons.push({
                id: page.id,
                path: page.path,
                label: page.title,
                title: page.title,
                icon: page.icon || 'FileText',
                parent_path: page.parent_path,
                published: page.published,
                is_parent: false // Default value, will be updated later
              });
            });
          } else {
            console.log(`No root pages found for language ${language}`);
          }
        }
      } else {
        // Siamo in un sottomenu - carica sottopagine specifiche per il path genitore
        console.log(`Loading subpages for parent path: ${parentPath}, language: ${language}`);
        
        // Verifica se il parentPath ha un prefisso lingua
        const hasLanguagePrefix = /^\/[a-z]{2}\//.test(parentPath);
        console.log(`Path has language prefix: ${hasLanguagePrefix}`);
        
        // Ottieni sottopagine in base al percorso
        const { data: subPages, error: subPagesError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path, published')
          .ilike('parent_path', parentPath)
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
          
          // Prova con ricerca case-insensitive come fallback
          const normalizedPath = parentPath.toLowerCase();
          console.log(`Trying fallback search with normalized path: ${normalizedPath}`);
          
          const { data: fallbackPages, error: fallbackError } = await supabase
            .from('custom_pages')
            .select('id, title, path, icon, parent_path, published')
            .filter('parent_path', 'ilike', `%${normalizedPath}%`)
            .eq('published', true);
            
          if (!fallbackError && fallbackPages && fallbackPages.length > 0) {
            console.log(`Found ${fallbackPages.length} pages with fallback search:`, fallbackPages);
            
            pageIcons = fallbackPages.map(page => ({
              id: page.id,
              path: page.path,
              label: page.title,
              title: page.title,
              icon: page.icon || 'FileText',
              parent_path: page.parent_path,
              published: page.published,
              is_parent: false
            }));
          }
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
          const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
          const iconString = JSON.stringify(uniqueIcons);
          
          // Only store if small enough to avoid quota issues
          if (iconString.length < 100000) { // ~100KB limit to be safer
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
        
        // Costruisci la query in base alla lingua
        let menuIconsQuery = supabase
          .from('menu_icons')
          .select('*')
          .eq('published', true);
          
        if (parentPath !== null) {
          menuIconsQuery = menuIconsQuery.eq('parent_path', parentPath);
        } else if (language !== 'it') {
          // Per menu principale in lingua diversa dall'italiano
          console.log(`Looking for menu icons with path/${language} or /${language}/`);
          menuIconsQuery = menuIconsQuery
            .or(`path.eq./${language},path.like./${language}/%`);
        } else {
          // Per italiano, escludi percorsi con prefissi lingua
          console.log("Looking for menu icons without language prefixes for Italian");
          menuIconsQuery = menuIconsQuery
            .not('path', 'like', '/en/%')
            .not('path', 'like', '/fr/%')
            .not('path', 'like', '/es/%')
            .not('path', 'like', '/de/%')
            .not('path', 'eq', '/en')
            .not('path', 'eq', '/fr')
            .not('path', 'eq', '/es')
            .not('path', 'eq', '/de');
        }
        
        const { data: menuIconsData, error: menuIconsError } = await menuIconsQuery;
        
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
          
          // Verificare se manca l'icona home in altre lingue
          if (language !== 'it' && parentPath === null) {
            // Controlla se abbiamo già l'icona home per questa lingua
            const hasHomePage = iconData.some(icon => icon.path === `/${language}`);
            
            if (!hasHomePage) {
              console.log(`No home icon found for ${language}, trying to add it`);
              
              // Verifica se esiste una pagina home per questa lingua
              const { data: langHomePage } = await supabase
                .from('custom_pages')
                .select('id, title, path, icon')
                .eq('path', `/${language}`)
                .eq('published', true)
                .maybeSingle();
                
              if (langHomePage) {
                console.log(`Found home page for ${language}, adding its icon`, langHomePage);
                
                iconData.push({
                  id: langHomePage.id,
                  path: langHomePage.path,
                  label: langHomePage.title,
                  title: langHomePage.title,
                  icon: 'Home',
                  parent_path: null,
                  bg_color: 'bg-blue-200',
                  published: true,
                  is_parent: false
                });
              }
            }
          }
          
          setIcons(iconData);
          
          // Safely store in localStorage
          try {
            const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
            const iconString = JSON.stringify(iconData);
            
            if (iconString.length < 100000) {
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
        const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger-1}`;
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
  }, [parentPath, refreshTrigger, language]);

  // Load icons when component mounts or refreshTrigger changes
  useEffect(() => {
    console.log(`useMenuIcons - Loading icons with refreshTrigger: ${refreshTrigger}, language: ${language}`);
    loadIcons();
  }, [loadIcons, refreshTrigger, language]);
  
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
      const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
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
