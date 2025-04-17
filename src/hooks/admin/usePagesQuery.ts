
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
      
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPages = data.map(page => formatPageData(page));
        setPages(formattedPages);
      }

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
