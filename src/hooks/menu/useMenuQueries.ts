
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";
import { useCurrentPath } from "@/hooks/useCurrentPath";

export const useMenuQueries = () => {
  const currentPath = useCurrentPath();
  const isHomePage = currentPath === '/home' || currentPath === '/' || currentPath.endsWith('/home');

  const fetchRootPagesAndHome = async (language: Language) => {
    try {
      console.log(`Recupero pagine root e home per lingua: ${language}`);
      
      let query = supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('published', true)
        .is('parent_path', null);  // Solo pagine root e no sottopagine

      // Add condition to exclude home path when on home page
      if (isHomePage) {
        query.not('path', 'in', ['/home', `/${language}/home`]);
      }

      // Filter by language and ensure no subpages
      if (language === 'it') {
        query = query
          .not('path', 'like', '/%/%')  // Exclude all subpages
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%');
      } else {
        query = query
          .and(`path.like./${language}/%,path.neq./${language}`) // Match language prefix but not just the language path
          .not('path', 'like', `/${language}/%/%`); // Exclude subpages for current language
      }

      const { data: pages, error } = await query;
      
      if (error) {
        console.error('Errore recupero pagine:', error);
        return { icons: [], error };
      }

      console.log(`Caricate ${pages?.length || 0} pagine root`);
      return { icons: pages || [], error: null };
    } catch (err) {
      console.error('Errore query pagine:', err);
      return { icons: [], error: err };
    }
  };

  const fetchSubPages = async (parentPath: string) => {
    try {
      console.log(`Recupero sottopagine per parent: ${parentPath}`);
      
      const { data: subPages, error: subPagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('parent_path', parentPath)
        .eq('published', true);
        
      console.log('Risultato sottopagine:', subPages);
      return { data: subPages, error: subPagesError };
    } catch (err) {
      console.error('Errore recupero sottopagine:', err);
      return { data: null, error: err };
    }
  };

  const checkForChildren = async (path: string) => {
    try {
      console.log(`Recupero figli di: ${path}`);
      
      const { count, error: countError } = await supabase
        .from('custom_pages')
        .select('id', { count: 'exact', head: true })
        .eq('parent_path', path)
        .eq('published', true);
        
      console.log(`Figli count per ${path}:`, count);
      return { count, error: countError };
    } catch (err) {
      console.error('Errore recupero figli:', err);
      return { count: 0, error: err };
    }
  };

  const fetchMenuIcons = async (parentPath: string | null, language: Language) => {
    try {
      console.log(`Recupero icone menu per parent: ${parentPath}, lingua: ${language}`);
      
      let query = supabase
        .from('menu_icons')
        .select('*')
        .eq('published', true);
        
      if (parentPath !== null) {
        query = query.eq('parent_path', parentPath);
      } else if (language !== 'it') {
        // For non-Italian languages, only get root level icons for that language
        query = query
          .and(`path.like./${language}/%,path.neq./${language}`)
          .not('path', 'like', `/${language}/%/%`);
      } else {
        // For Italian, exclude other language paths and subpages
        query = query
          .not('path', 'like', '/%/%')
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%');
      }
      
      const result = await query;
      console.log('Risultato icone menu:', result);
      return result;
    } catch (err) {
      console.error('Errore recupero icone menu:', err);
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
