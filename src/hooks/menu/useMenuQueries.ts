import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";

export const useMenuQueries = () => {
  const fetchRootPagesAndHome = async (language: Language) => {
    try {
      console.log(`Recupero pagine root e home per lingua: ${language}`);
      
      const query = supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('published', true);

      if (language === 'it') {
        query.or(`path.eq./home,and(is_parent.is.null,not.path.like./%/%)`)
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%');
      } else {
        query.or(`path.eq./${language},path.like./${language}/%,path.eq./${language}/home`);
      }

      const { data: pages, error } = await query;
      
      if (error) {
        console.error('Errore recupero pagine:', error);
        return { icons: [], error };
      }

      // Ordina le pagine mettendo home all'inizio
      const sortedPages = pages?.sort((a, b) => {
        if (a.path === '/home' || a.path === `/${language}/home`) return -1;
        if (b.path === '/home' || b.path === `/${language}/home`) return 1;
        return 0;
      });

      console.log(`Caricate ${sortedPages?.length || 0} pagine`);
      return { icons: sortedPages || [], error: null };
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
        query = query.or(`path.eq./${language},path.like./${language}/%`);
      } else {
        query = query
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%')
          .not('path', 'eq', '/en')
          .not('path', 'eq', '/fr')
          .not('path', 'eq', '/es')
          .not('path', 'eq', '/de');
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
    fetchMenuIcons,
    checkForChildren
  };
};
