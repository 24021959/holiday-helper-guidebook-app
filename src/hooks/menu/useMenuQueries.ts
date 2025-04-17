
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/translation.types";
import { IconData } from "./types";

export const useMenuQueries = () => {
  const fetchRootPages = async (language: Language) => {
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
    const { data: langHomePage } = await supabase
      .from('custom_pages')
      .select('id, title, path, icon, parent_path, published')
      .eq('path', `/${language}`)
      .eq('published', true)
      .maybeSingle();

    return langHomePage;
  };

  const fetchSubPages = async (parentPath: string) => {
    const { data: subPages, error: subPagesError } = await supabase
      .from('custom_pages')
      .select('id, title, path, icon, parent_path, published')
      .ilike('parent_path', parentPath)
      .eq('published', true);

    return { data: subPages, error: subPagesError };
  };

  const fetchMenuIcons = async (language: Language, parentPath: string | null) => {
    let menuIconsQuery = supabase
      .from('menu_icons')
      .select('*')
      .eq('published', true);

    if (parentPath !== null) {
      menuIconsQuery = menuIconsQuery.eq('parent_path', parentPath);
    } else if (language !== 'it') {
      menuIconsQuery = menuIconsQuery
        .or(`path.eq./${language},path.like./${language}/%`);
    } else {
      menuIconsQuery = menuIconsQuery
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .not('path', 'eq', '/en')
        .not('path', 'eq', '/fr')
        .not('path', 'eq', '/es')
        .not('path', 'eq', '/de');
    }

    return await menuIconsQuery;
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
    fetchRootPages,
    fetchHomePageForLanguage,
    fetchSubPages,
    fetchMenuIcons,
    checkForChildren
  };
};
