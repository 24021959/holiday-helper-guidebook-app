
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { usePageDataFormatter } from "./usePageDataFormatter";

export const usePagesQuery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<PageData[]>([]);
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const { formatPageData } = usePageDataFormatter();

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      
      // First, get the home page
      const { data: homeData, error: homeError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('path', '/home')
        .maybeSingle();

      if (homeError) throw homeError;

      // Then get all other pages
      const { data: regularPages, error } = await supabase
        .from('custom_pages')
        .select('*')
        .neq('path', '/home')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Combine home page with other pages if it exists
      const allPages = [];
      if (homeData) {
        allPages.push(formatPageData(homeData));
      }
      if (regularPages) {
        allPages.push(...regularPages.map(page => formatPageData(page)));
      }

      setPages(allPages);

      // Get all parent pages for dropdown selections
      const { data: allData } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('is_parent', true);
      
      if (allData) {
        const allParentPages = allData.map(page => formatPageData(page));
        setParentPages(allParentPages);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Errore nel caricamento delle pagine");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pages,
    parentPages,
    isLoading,
    fetchPages
  };
};
