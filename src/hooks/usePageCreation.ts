
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageItem } from "@/types/image.types";
import { PageFormValues, PageType } from "@/types/form.types";
import { usePageSaving } from "./page/usePageSaving";
import { usePageDeletion } from "./page/usePageDeletion";
import { usePageTranslation } from "./page/usePageTranslation";
import { usePageFormatting } from "./page/usePageFormatting";

interface UsePageCreationProps {
  onPageCreated: (pages: any[]) => void;
}

export const usePageCreation = ({ onPageCreated }: UsePageCreationProps) => {
  const { isCreating, setIsCreating, saveNewPage } = usePageSaving();
  const { isTranslating, translatePages } = usePageTranslation();
  const { deletePageAndTranslations } = usePageDeletion();

  const handleTranslateAndCreate = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      setIsCreating(true);
      
      // Create path based on the page type
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      let finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;

      // Save only the Italian version first
      const pageId = await saveNewPage(
        values.title,
        values.content,
        finalPath,
        imageUrl,
        values.icon,
        values.pageType,
        values.pageType === "submenu" ? values.parentPath || null : null,
        pageImages
      );

      toast.success("Pagina in italiano creata con successo");

      // Solo dopo il salvataggio della pagina italiana, avvia le traduzioni
      if (pageId) {
        try {
          await translatePages(
            values.content,
            values.title,
            finalPath,
            imageUrl,
            values.icon,
            values.pageType,
            values.pageType === "submenu" ? values.parentPath || null : null,
            pageImages
          );
          
          const { data: pagesData, error: fetchError } = await supabase
            .from('custom_pages')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fetchError) throw fetchError;
          
          if (pagesData) {
            onPageCreated(pagesData);
            toast.success("Traduzioni completate con successo");
            onSuccess();
          }
        } catch (translationError) {
          console.error("Errore durante la traduzione:", translationError);
          toast.error("Errore durante la traduzione delle pagine");
          // La pagina italiana è comunque salvata, quindi non è necessario rollback
        }
      }
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    isTranslating,
    handleTranslateAndCreate,
    deletePageAndTranslations
  };
};
