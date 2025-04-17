
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { IconData, MenuIconsProps } from "./types";
import { useMenuQueries } from "./useMenuQueries";
import { useIconCache } from "./useIconCache";

export const useMenuIcons = ({ parentPath, refreshTrigger = 0 }: MenuIconsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconData[]>([]);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const queries = useMenuQueries();
  const { getCachedIcons, cacheIcons, clearIconCache } = useIconCache();

  const processPageIconData = (page: any): IconData => ({
    id: page.id,
    path: page.path,
    label: page.title,
    title: page.title,
    icon: page.icon || 'FileText',
    parent_path: page.parent_path,
    published: page.published,
    is_parent: false
  });

  const loadIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasConnectionError(false);

      const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger}`;
      clearIconCache(cacheKey);

      console.log(`Loading icons for parentPath: ${parentPath}`);

      let pageIcons: IconData[] = [];

      if (parentPath === null) {
        // Load root level pages - Italian only version
        const { data: rootPages, error: rootError } = await queries.fetchRootPages();
        
        if (rootError) throw rootError;

        if (rootPages && rootPages.length > 0) {
          pageIcons = rootPages.map(processPageIconData);

          // Check for home page
          const hasHomePage = pageIcons.some(icon => icon.path === '/home');
          if (!hasHomePage) {
            const homePage = await queries.fetchHomePageForLanguage();
            if (homePage) {
              pageIcons.push(processPageIconData(homePage));
            }
          }
        }
      } else {
        // Load subpages
        const { data: subPages, error: subPagesError } = await queries.fetchSubPages(parentPath);
        
        if (subPagesError) throw subPagesError;

        if (subPages && subPages.length > 0) {
          pageIcons = subPages.map(processPageIconData);
        } else {
          // Try menu icons as fallback
          const { data: menuIconsData, error: menuIconsError } = await queries.fetchMenuIcons(parentPath);
          
          if (!menuIconsError && menuIconsData && menuIconsData.length > 0) {
            pageIcons = menuIconsData.map(icon => ({
              id: icon.id,
              path: icon.path,
              label: icon.label,
              title: icon.label,
              icon: icon.icon,
              parent_path: icon.parent_path,
              bg_color: icon.bg_color,
              published: icon.published,
              is_parent: false
            }));
          }
        }
      }

      // Check for parent pages
      if (pageIcons.length > 0) {
        const updatedIcons = [...pageIcons];
        
        for (let i = 0; i < updatedIcons.length; i++) {
          const icon = updatedIcons[i];
          if (icon.path) {
            const { count, error: countError } = await queries.checkForChildren(icon.path);
            if (!countError && count !== null && count > 0) {
              updatedIcons[i] = { ...icon, is_parent: true };
            }
          }
        }

        const uniqueIcons = Array.from(
          new Map(updatedIcons.map(icon => [icon.path, icon])).values()
        );

        setIcons(uniqueIcons);
        cacheIcons(cacheKey, uniqueIcons);
      } else {
        setIcons([]);
      }
    } catch (error) {
      console.error("Error in loadIcons:", error);
      setHasConnectionError(true);
      setError("Error loading menu. Try again later.");

      // Try to use cached icons as fallback
      const cacheKey = `icons_${parentPath || 'root'}_${refreshTrigger-1}`;
      const cachedIcons = getCachedIcons(cacheKey);
      if (cachedIcons && cachedIcons.length > 0) {
        console.log(`Using ${cachedIcons.length} cached icons as fallback after error`);
        setIcons(cachedIcons);
      }
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, refreshTrigger, queries, cacheIcons, clearIconCache, getCachedIcons]);

  useEffect(() => {
    console.log(`useMenuIcons - Loading icons with refreshTrigger: ${refreshTrigger}`);
    loadIcons();
  }, [loadIcons, refreshTrigger]);

  useEffect(() => {
    if (hasConnectionError && retryCount < 3) {
      const retryTime = 3000 * (retryCount + 1);
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
