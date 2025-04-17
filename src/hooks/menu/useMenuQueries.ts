import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";

export const useMenuQueries = () => {
  const fetchRootPagesForLanguage = async (language: Language) => {
    try {
      console.log(`Fetching root pages for language: ${language}`);
      
      let homePage = null;
      let otherPages = [];

      // First, fetch home page
      const homePagePath = language === 'it' ? '/home' : `/${language}`;
      const { data: homePageData, error: homeError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('path', homePagePath)
        .eq('published', true)
        .maybeSingle();

      if (homePageData) {
        homePage = homePageData;
      }

      // Then fetch other root pages
      if (language === 'it') {
        const { data: rootPages, error: rootError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path, published')
          .is('parent_path', null)
          .eq('published', true)
          .not('path', 'eq', '/home')
          .not('path', 'like', '/en/%')
          .not('path', 'like', '/fr/%')
          .not('path', 'like', '/es/%')
          .not('path', 'like', '/de/%');
          
        otherPages = rootPages || [];
      } else {
        const { data: langPages, error: langError } = await supabase
          .from('custom_pages')
          .select('id, title, path, icon, parent_path, published')
          .is('parent_path', null)
          .eq('published', true)
          .like('path', `/${language}/%`)
          .not('path', 'eq', `/${language}`);
          
        otherPages = langPages || [];
      }

      // Combine home page and other pages, with home page first
      const pageIcons = homePage ? [homePage, ...otherPages] : otherPages;
      
      console.log(`Loaded ${pageIcons.length} root pages`);
      return { data: pageIcons, error: null };
    } catch (err) {
      console.error('Error fetching root pages:', err);
      return { data: null, error: err };
    }
  };

  const fetchHomePageForLanguage = async (language: Language) => {
    try {
      let path = language === 'it' ? '/home' : `/${language}`;
      console.log(`Fetching home page with path: ${path}`);
      
      const { data: homePage, error } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .eq('path', path)
        .eq('published', true)
        .maybeSingle();
        
      console.log('Home page result:', homePage, error);
      return homePage;
    } catch (err) {
      console.error('Error fetching home page:', err);
      return null;
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

  const fetchMenuIcons = async (parentPath: string | null, language: Language) => {
    try {
      console.log(`Fetching menu icons for parent: ${parentPath}, language: ${language}`);
      
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
      console.log('Menu icons result:', result);
      return result;
    } catch (err) {
      console.error('Error fetching menu icons:', err);
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

  return {
    fetchRootPagesForLanguage,
    fetchHomePageForLanguage,
    fetchSubPages,
    fetchMenuIcons,
    checkForChildren
  };
};
