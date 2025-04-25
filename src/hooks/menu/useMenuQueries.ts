import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";
import { useCurrentPath, useCurrentLanguagePath } from "@/hooks/useCurrentPath";

export const useMenuQueries = () => {
  const currentPath = useCurrentPath();
  const currentLanguage = useCurrentLanguagePath();
  const isHomePage = currentPath === '/home' || currentPath === '/' || currentPath.endsWith('/home');

  const fetchRootPagesAndHome = async (language: Language) => {
    try {
      console.log(`[fetchRootPagesAndHome] Starting query for language: ${language}`);
      
      let query = supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published, translations')
        .eq('published', true)
        .is('parent_path', null);
      
      // Apply language filtering
      if (language === 'it') {
        query = query
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%');
      } else {
        query = query.like('path', `/${language}/%`);
      }

      const { data: pages, error } = await query;
      
      if (error) {
        console.error('[fetchRootPagesAndHome] Error fetching pages:', error);
        return { icons: [], error };
      }

      console.log(`[fetchRootPagesAndHome] Loaded ${pages?.length || 0} root pages:`, pages);
      return { icons: pages || [], error: null };
    } catch (err) {
      console.error('[fetchRootPagesAndHome] Error in query:', err);
      return { icons: [], error: err };
    }
  };

  const fetchSubPages = async (parentPath: string) => {
    try {
      console.log(`Fetching subpages for parent: ${parentPath}`);
      
      const { data: subPages, error: subPagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      console.log('Subpages result:', subPages);
      return { data: subPages, error: subPagesError };
    } catch (err) {
      console.error('Error fetching subpages:', err);
      return { data: null, error: err };
    }
  };

  const checkForChildren = async (path: string) => {
    try {
      console.log(`Checking for children of: ${path}`);
      
      const { count, error: countError } = await supabase
        .from('custom_pages')
        .select('id', { count: 'exact', head: true })
        .eq('parent_path', path)
        .eq('published', true);
        
      console.log(`Children count for ${path}:`, count);
      return { count, error: countError };
    } catch (err) {
      console.error('Error checking for children:', err);
      return { count: 0, error: err };
    }
  };

  const fetchMenuIcons = async (parentPath: string | null, language: Language) => {
    try {
      console.log(`[fetchMenuIcons] Starting query - parent: ${parentPath}, language: ${language}`);
      
      let query = supabase
        .from('menu_icons')
        .select('*')
        .eq('published', true);

      // First filter by parent path
      if (parentPath === null) {
        query = query.is('parent_path', null);
      } else {
        query = query.eq('parent_path', parentPath);
      }
        
      // Then apply language filtering
      if (language !== 'it') {
        query = query.like('path', `/${language}/%`);
      } else {
        query = query
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%');
      }
      
      const result = await query;
      console.log('[fetchMenuIcons] Menu icons result:', result);
      return result;
    } catch (err) {
      console.error('[fetchMenuIcons] Error fetching menu icons:', err);
      return { data: null, error: err };
    }
  };

  return {
    fetchRootPagesAndHome,
    fetchSubPages,
    checkForChildren,
    fetchMenuIcons
  };
};
