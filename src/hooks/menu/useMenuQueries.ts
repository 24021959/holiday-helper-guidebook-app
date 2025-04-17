
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";

export const useMenuQueries = () => {
  const fetchRootPagesForLanguage = async (language: Language) => {
    if (language === 'it') {
      const { data: rootPages, error: rootError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .is('parent_path', null)
        .eq('published', true)
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%');
        
      return { data: rootPages, error: rootError };
    } else {
      // For other languages, load only pages with language prefix
      const { data: langPages, error: langError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, published')
        .is('parent_path', null)
        .eq('published', true)
        .like('path', `/${language}/%`);
        
      return { data: langPages, error: langError };
    }
  };

  const fetchHomePageForLanguage = async (language: Language) => {
    const path = language === 'it' ? '/home' : `/${language}`;
    const { data: homePage } = await supabase
      .from('custom_pages')
      .select('id, title, path, icon, parent_path, published')
      .eq('path', path)
      .eq('published', true)
      .maybeSingle();
      
    return homePage;
  };

  const fetchSubPages = async (parentPath: string) => {
    const { data: subPages, error: subPagesError } = await supabase
      .from('custom_pages')
      .select('id, title, path, icon, parent_path, published')
      .ilike('parent_path', parentPath)
      .eq('published', true);
      
    return { data: subPages, error: subPagesError };
  };

  const fetchMenuIcons = async (parentPath: string | null, language: Language) => {
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
    
    return await query;
  };

  const checkForChildren = async (path: string) => {
    const { count, error: countError } = await supabase
      .from('custom_pages')
      .select('id', { count: 'exact', head: true })
      .eq('parent_path', path)
      .eq('published', true);
      
    return { count, error: countError };
  };

  return {
    fetchRootPagesForLanguage,
    fetchHomePageForLanguage,
    fetchSubPages,
    fetchMenuIcons,
    checkForChildren
  };
};
