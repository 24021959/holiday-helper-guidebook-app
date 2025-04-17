import { useState, useEffect } from "react";
import { PageData } from "@/types/page.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageDeletion } from "../page/usePageDeletion";

export const useAdminPages = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('it');
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePageAndTranslations } = usePageDeletion();

  const fetchPages = async (langCode: string) => {
    try {
      setIsLoading(true);
      let query = supabase.from('custom_pages').select('*');
      
      if (langCode === 'it') {
        // For Italian, exclude paths with language prefixes,
        // but include the root path (/) and /home
        query = query.not('path', 'like', '/en/%')
                     .not('path', 'like', '/fr/%')
                     .not('path', 'like', '/es/%')
                     .not('path', 'like', '/de/%')
                     .not('path', 'eq', '/en')
                     .not('path', 'eq', '/fr')
                     .not('path', 'eq', '/es')
                     .not('path', 'eq', '/de');
                     
      } else {
        // For other languages, include paths with the specific language prefix
        // or the root path for that language (/en, /fr, etc.)
        query = query.or(`path.eq./${langCode},path.like./${langCode}/%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPages = data.map(page => formatPageData(page));
        console.log(`Fetched ${formattedPages.length} pages for language: ${langCode}`);
        setPages(formattedPages);
      }

      // Fetch all pages to use as parent options
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

  const formatPageData = (page: any): PageData => ({
    id: page.id,
    title: page.title,
    content: page.content,
    path: page.path,
    imageUrl: page.image_url,
    icon: page.icon,
    listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
    listItems: page.list_items,
    isSubmenu: page.is_submenu || false,
    parentPath: page.parent_path || undefined,
    pageImages: page.content ? extractImagesFromContent(page.content) : [],
    published: page.published,
    is_parent: page.is_parent || false
  });

  const extractImagesFromContent = (content: string) => {
    try {
      const images: { url: string; position: "left" | "center" | "right" | "full"; caption?: string; }[] = [];
      if (!content.includes('<!-- IMAGES -->')) return [];
      
      const imagesSection = content.split('<!-- IMAGES -->')[1];
      if (!imagesSection) return [];
      
      const imageObjects = imagesSection.match(/\n(\{.*?\})\n/g);
      if (!imageObjects) return [];
      
      imageObjects.forEach(imgStr => {
        try {
          const img = JSON.parse(imgStr.trim());
          if (img.type === 'image' && img.url) {
            images.push({
              url: img.url,
              position: img.position || 'center',
              caption: img.caption || ''
            });
          }
        } catch (e) {
          console.error('Error parsing image JSON:', e);
        }
      });
      
      return images;
    } catch (error) {
      console.error('Error extracting images:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPages(currentLanguage);
  }, [currentLanguage]);

  const confirmDeletePage = async (pageToDelete: PageData) => {
    if (!pageToDelete) return;
    
    try {
      setIsDeleting(true);
      const isItalianPage = !pageToDelete.path.match(/^\/[a-z]{2}($|\/)/);
      
      await deletePageAndTranslations(pageToDelete.path);
      await fetchPages(currentLanguage);
      
      if (isItalianPage) {
        toast.success("Pagina italiana e tutte le sue traduzioni eliminate con successo");
      } else {
        toast.success("Pagina tradotta eliminata con successo");
      }
    } catch (error) {
      console.error("Error in confirmDelete:", error);
      toast.error("Errore nell'eliminazione della pagina");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    pages,
    parentPages,
    isLoading,
    currentLanguage,
    setCurrentLanguage,
    isDeleting,
    fetchPages,
    confirmDeletePage
  };
};
