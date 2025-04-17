
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { IconData, MenuIconsProps } from "./types";
import { useMenuQueries } from "./useMenuQueries";
import { useIconCache } from "./useIconCache";
import { useIconProcessor } from "./useIconProcessor";
import { useTranslation } from "@/context/TranslationContext";

export const useMenuIcons = ({ parentPath, refreshTrigger = 0 }: MenuIconsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const queries = useMenuQueries();
  const { getCachedIcons, cacheIcons, clearIconCache } = useIconCache();
  const { processPageData, processMenuIconData, checkParentStatus } = useIconProcessor();
  const { language } = useTranslation();

  const loadIcons = useCallback(async () => {
    try {
      console.log(`Loading icons for: ${parentPath || 'root'}, language: ${language}`);
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);
      
      const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger}`;
      clearIconCache(cacheKey);
      
      let pageIcons: IconData[] = [];

      if (parentPath === null) {
        // Load root level pages
        console.log("Loading root level pages");
        const { data: rootPages, error: rootError } = await queries.fetchRootPagesForLanguage(language);
        
        if (rootError) {
          console.error("Root pages error:", rootError);
          throw rootError;
        }

        if (rootPages && rootPages.length > 0) {
          console.log(`Found ${rootPages.length} root pages`);
          pageIcons = rootPages.map(processPageData);
          
          // Check for home page
          const hasHomePage = pageIcons.some(icon => 
            icon.path === (language === 'it' ? '/home' : `/${language}`)
          );
          
          console.log("Has home page:", hasHomePage);
          if (!hasHomePage) {
            const homePage = await queries.fetchHomePageForLanguage(language);
            if (homePage) {
              console.log("Adding home page to icons");
              pageIcons.push(processPageData(homePage));
            }
          }
        } else {
          console.log("No root pages found, trying menu icons");
          // Try to load menu icons as fallback
          const { data: menuIconsData, error: menuIconsError } = await queries.fetchMenuIcons(null, language);
          
          if (!menuIconsError && menuIconsData && menuIconsData.length > 0) {
            console.log(`Found ${menuIconsData.length} menu icons`);
            pageIcons = menuIconsData.map(processMenuIconData);
          }
        }
      } else {
        // Load subpages
        console.log(`Loading subpages for: ${parentPath}`);
        const { data: subPages, error: subPagesError } = await queries.fetchSubPages(parentPath);
        
        if (subPagesError) {
          console.error("Subpages error:", subPagesError);
          throw subPagesError;
        }

        if (subPages && subPages.length > 0) {
          console.log(`Found ${subPages.length} subpages`);
          pageIcons = subPages.map(processPageData);
        } else {
          console.log("No subpages found, trying menu icons");
          // Try menu icons as fallback
          const { data: menuIconsData, error: menuIconsError } = await queries.fetchMenuIcons(parentPath, language);
          
          if (!menuIconsError && menuIconsData && menuIconsData.length > 0) {
            console.log(`Found ${menuIconsData.length} menu icons`);
            pageIcons = menuIconsData.map(processMenuIconData);
          }
        }
      }

      if (pageIcons.length > 0) {
        console.log(`Processing ${pageIcons.length} icons`);
        const processedIcons = await checkParentStatus(pageIcons);
        const uniqueIcons = Array.from(
          new Map(processedIcons.map(icon => [icon.path, icon])).values()
        );
        
        console.log(`Loaded ${uniqueIcons.length} unique icons`);
        setIcons(uniqueIcons);
        cacheIcons(cacheKey, uniqueIcons);
      } else {
        console.log("No icons found");
        setIcons([]);
      }
    } catch (error) {
      console.error("Error in loadIcons:", error);
      setHasConnectionError(true);
      setError("Error loading menu. Try again later.");
      
      const cacheKey = `icons_${parentPath || 'root'}_${language}_${refreshTrigger-1}`;
      const cachedIcons = getCachedIcons(cacheKey);
      if (cachedIcons && cachedIcons.length > 0) {
        console.log(`Using ${cachedIcons.length} cached icons as fallback after error`);
        setIcons(cachedIcons);
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, refreshTrigger, language, queries, processPageData, processMenuIconData, checkParentStatus, cacheIcons, clearIconCache, getCachedIcons]);

  useEffect(() => {
    console.log(`useMenuIcons - Loading icons with refreshTrigger: ${refreshTrigger}, language: ${language}`);
    loadIcons();
  }, [loadIcons, refreshTrigger, language]);

  useEffect(() => {
    if (hasConnectionError && retryCount < 3) {
      const retryTime = 3000 * (retryCount + 1);
      console.log(`Will retry connection in ${retryTime/1000}s (attempt ${retryCount + 1})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadIcons();
      }, retryTime);
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionError, retryCount, loadIcons]);

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
