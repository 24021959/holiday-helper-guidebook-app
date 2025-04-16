
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/types/page.types";
import { usePageCreation } from "@/hooks/usePageCreation";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/admin/manage/LanguageSelector";
import { LanguageInfoBanner } from "@/components/admin/manage/LanguageInfoBanner";
import { PagesList } from "@/components/admin/manage/PagesList";
import { DeletePageDialog } from "@/components/admin/manage/DeletePageDialog";

const AdminManage = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPage, setDeletingPage] = useState<PageData | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('it');
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePageAndTranslations } = usePageCreation({ onPageCreated: setPages });

  const fetchPages = async (langCode: string) => {
    try {
      setIsLoading(true);
      let query = supabase.from('custom_pages').select('*');
      
      if (langCode === 'it') {
        query = query.not('path', 'like', '/en/%')
                     .not('path', 'like', '/fr/%')
                     .not('path', 'like', '/es/%')
                     .not('path', 'like', '/de/%');
      } else {
        query = query.like('path', `/${langCode}/%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPages = data.map(page => ({
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
        }));
        setPages(formattedPages);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Errore nel caricamento delle pagine");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleView = (page: PageData) => {
    window.open(`/preview${page.path}`, '_blank');
  };

  const handleDelete = (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingPage) return;
    
    try {
      setIsDeleting(true);
      const isItalianPage = !deletingPage.path.match(/^\/[a-z]{2}\//);
      
      await deletePageAndTranslations(deletingPage.path);
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
      setShowDeleteDialog(false);
      setDeletingPage(null);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestione Pagine</h2>
        <LanguageSelector 
          currentLanguage={currentLanguage} 
          onLanguageChange={setCurrentLanguage} 
        />
      </div>

      <LanguageInfoBanner currentLanguage={currentLanguage} />

      <PagesList 
        pages={pages}
        onView={handleView}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <DeletePageDialog 
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        page={deletingPage}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminManage;
