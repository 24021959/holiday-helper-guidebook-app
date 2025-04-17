
import { supabase } from "@/integrations/supabase/client";

export const useMenuQueries = () => {
  // Fetch root level pages - Italian only
  const fetchRootPages = async () => {
    const { data: rootPages, error: rootError } = await supabase
      .from('custom_pages')
      .select('id, title, path, icon, parent_path, published')
      .is('parent_path', null)
      .eq('published', true);

    return { data: rootPages, error: rootError };
  };

  const fetchHomePageForLanguage = async () => {
    const { data: homePage } = await supabase
      .from('custom_pages')
      .select('id, title, path, icon, parent_path, published')
      .eq('path', '/home')
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

  const fetchMenuIcons = async (parentPath: string | null) => {
    let menuIconsQuery = supabase
      .from('menu_icons')
      .select('*')
      .eq('published', true);

    if (parentPath !== null) {
      menuIconsQuery = menuIconsQuery.eq('parent_path', parentPath);
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
