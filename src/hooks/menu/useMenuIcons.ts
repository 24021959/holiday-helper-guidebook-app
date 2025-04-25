import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { IconData } from "./types";
import { useMenuQueries } from "./useMenuQueries";
import { useIconCache } from "./useIconCache";
import { useIconProcessor } from "./useIconProcessor";
import { useTranslation } from "@/context/TranslationContext";
import { useMockIcons } from "./useMockIcons";
import { useConnectionRetry } from "./useConnectionRetry";
import { useCurrentPath } from "@/hooks/useCurrentPath";

interface MenuIconsProps {
  parentPath: string | null;
  refreshTrigger?: number;
}

export const useMenuIcons = ({ parentPath, refreshTrigger = 0 }: MenuIconsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);
  const loadingRef = useRef(false);
  
  const queries = useMenuQueries();
  const { getCachedIcons, cacheIcons } = useIconCache();
  const { processPageData, processMenuIconData, checkParentStatus } = useIconProcessor();
  const { language } = useTranslation();
  const { getMockIcons } = useMockIcons();
  const currentPath = useCurrentPath();
  const isHomePage = currentPath === '/home' || currentPath === '/' || currentPath.endsWith('/home');

  const loadIcons = useCallback(async () => {
    // Previene chiamate multiple contemporanee
    if (loadingRef.current) {
      console.log("Caricamento già in corso, skip");
      return;
    }

    try {
      console.log(`Caricamento icone per: ${parentPath || 'root'}, lingua: ${language}`);
      loadingRef.current = true;
      
      // Creiamo una chiave di cache unica
      const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
      const cachedIcons = getCachedIcons(cacheKey);
      
      if (cachedIcons && cachedIcons.length > 0) {
        console.log(`Uso ${cachedIcons.length} icone dalla cache mentre carico i dati freschi`);
        setIcons(cachedIcons);
        setIsLoading(false);
      }

      let pageIcons: IconData[] = [];
      
      if (parentPath === null) {
        const { icons: rootIcons, error: rootError } = await queries.fetchRootPagesAndHome(language);
        
        if (rootError) {
          console.error("Errore caricamento root pages:", rootError);
          throw rootError;
        }

        if (rootIcons && rootIcons.length > 0) {
          pageIcons = rootIcons.map(processPageData);
        } else {
          const { data: menuIconsData } = await queries.fetchMenuIcons(null, language);
          if (menuIconsData && menuIconsData.length > 0) {
            pageIcons = menuIconsData.map(processMenuIconData);
          }
        }
      } else {
        const { data: subPages, error: subPagesError } = await queries.fetchSubPages(parentPath);
        
        if (subPagesError) {
          throw subPagesError;
        }

        if (subPages && subPages.length > 0) {
          pageIcons = subPages.map(processPageData);
        }
      }

      if (pageIcons.length > 0) {
        const processedIcons = await checkParentStatus(pageIcons);
        
        // Filter out home icon when on home page
        const filteredIcons = isHomePage 
          ? processedIcons.filter(icon => !icon.path.endsWith('/home'))
          : processedIcons;
        
        const uniqueIcons = Array.from(
          new Map(filteredIcons.map(icon => [icon.path, icon])).values()
        );
        
        setIcons(uniqueIcons);
        cacheIcons(cacheKey, uniqueIcons);
        setError(null);
      } else {
        if (!cachedIcons || cachedIcons.length === 0) {
          const mockIcons = getMockIcons();
          setIcons(mockIcons);
          cacheIcons(cacheKey, mockIcons);
        }
      }

    } catch (error: any) {
      console.error("Errore in loadIcons:", error);
      const errorMsg = error?.message || "Errore caricamento menu. Riprova più tardi.";
      setError(errorMsg);
      
      // Usiamo le icone mock solo se non abbiamo già delle icone
      if (!icons.length) {
        const mockIcons = getMockIcons();
        setIcons(mockIcons);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [parentPath, refreshTrigger, language, isHomePage]);

  const { hasConnectionError, setHasConnectionError, retryCount, setRetryCount } = 
    useConnectionRetry(loadIcons);

  useEffect(() => {
    console.log(`useMenuIcons - Loading icons with refreshTrigger: ${refreshTrigger}, language: ${language}`);
    loadIcons();
    
    // Definiamo un cleanup per sicurezza
    return () => {
      loadingRef.current = false;
    };
  }, [loadIcons, refreshTrigger, language]);

  const refreshIcons = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    loadIcons();
  }, [loadIcons, setRetryCount]);

  return {
    icons,
    isLoading,
    error,
    refreshIcons
  };
};
