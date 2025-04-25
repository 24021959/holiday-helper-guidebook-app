
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { IconData, MenuIconsProps } from "./types";
import { useMenuQueries } from "./useMenuQueries";
import { useIconCache } from "./useIconCache";
import { useIconProcessor } from "./useIconProcessor";
import { useTranslation } from "@/context/TranslationContext";
import { useMockIcons } from "./useMockIcons";
import { useConnectionRetry } from "./useConnectionRetry";

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

  const loadIcons = useCallback(async () => {
    // Previene chiamate multiple contemporanee
    if (loadingRef.current) {
      console.log("Caricamento già in corso, skip");
      return;
    }

    try {
      console.log(`Caricamento icone per: ${parentPath || 'root'}, lingua: ${language}`);
      loadingRef.current = true;
      setError(null);
      
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

        pageIcons = subPages ? subPages.map(processPageData) : [];
      }

      if (pageIcons.length > 0) {
        const processedIcons = await checkParentStatus(pageIcons);
        const uniqueIcons = Array.from(
          new Map(processedIcons.map(icon => [icon.path, icon])).values()
        );
        setIcons(uniqueIcons);
        cacheIcons(cacheKey, uniqueIcons);
      } else if (!cachedIcons || cachedIcons.length === 0) {
        const mockIcons = getMockIcons();
        setIcons(mockIcons);
        cacheIcons(cacheKey, mockIcons);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error("Errore in loadIcons:", error);
      const errorMsg = error?.message || "Errore caricamento menu. Riprova più tardi.";
      setError(errorMsg);
      
      if (!icons.length) {
        const mockIcons = getMockIcons();
        setIcons(mockIcons);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [parentPath, refreshTrigger, language]);

  const { hasConnectionError, setHasConnectionError, retryCount, setRetryCount } = useConnectionRetry(loadIcons);

  useEffect(() => {
    console.log(`useMenuIcons - Loading icons with refreshTrigger: ${refreshTrigger}, language: ${language}`);
    loadIcons();
  }, [loadIcons, refreshTrigger, language]);

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
