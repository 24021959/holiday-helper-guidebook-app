
import { useState, useCallback, useEffect } from "react";
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
  
  const queries = useMenuQueries();
  const { getCachedIcons, cacheIcons } = useIconCache();
  const { processPageData, processMenuIconData, checkParentStatus } = useIconProcessor();
  const { language } = useTranslation();
  const { getMockIcons } = useMockIcons();
  
  const loadIcons = useCallback(async () => {
    try {
      console.log(`Loading icons for: ${parentPath || 'root'}, language: ${language}`);
      setIsLoading(true);
      setError(null);
      
      const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
      const cachedIcons = getCachedIcons(cacheKey);
      
      if (cachedIcons && cachedIcons.length > 0) {
        console.log(`Using ${cachedIcons.length} cached icons while loading fresh data`);
        setIcons(cachedIcons);
      }
      
      let pageIcons: IconData[] = [];

      if (parentPath === null) {
        const { data: rootPages, error: rootError } = await queries.fetchRootPagesForLanguage(language);
        
        if (rootError) {
          console.error("Root pages error:", rootError);
          throw rootError;
        }

        if (rootPages && rootPages.length > 0) {
          pageIcons = rootPages.map(processPageData);
          const homePage = await queries.fetchHomePageForLanguage(language);
          if (homePage) {
            pageIcons.push(processPageData(homePage));
          }
        } else {
          const { data: menuIconsData, error: menuIconsError } = await queries.fetchMenuIcons(null, language);
          if (!menuIconsError && menuIconsData && menuIconsData.length > 0) {
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
        } else {
          const { data: menuIconsData, error: menuIconsError } = await queries.fetchMenuIcons(parentPath, language);
          if (!menuIconsError && menuIconsData && menuIconsData.length > 0) {
            pageIcons = menuIconsData.map(processMenuIconData);
          }
        }
      }

      if (pageIcons.length > 0) {
        const processedIcons = await checkParentStatus(pageIcons);
        const uniqueIcons = Array.from(
          new Map(processedIcons.map(icon => [icon.path, icon])).values()
        );
        setIcons(uniqueIcons);
        cacheIcons(cacheKey, uniqueIcons);
      } else {
        const mockIcons = getMockIcons();
        setIcons(mockIcons);
        cacheIcons(cacheKey, mockIcons);
      }
    } catch (error: any) {
      console.error("Error in loadIcons:", error);
      const errorMsg = error?.message || "Error loading menu. Try again later.";
      setError(errorMsg);
      
      const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger-1}`;
      const cachedIcons = getCachedIcons(cacheKey);
      
      if (cachedIcons && cachedIcons.length > 0) {
        setIcons(cachedIcons);
      } else {
        const mockIcons = getMockIcons();
        setIcons(mockIcons);
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, refreshTrigger, language, queries, processPageData, processMenuIconData, checkParentStatus, cacheIcons, getCachedIcons]);

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
