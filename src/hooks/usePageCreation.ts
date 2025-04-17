
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

  /**
   * Salva la pagina senza traduzione automatica
   */
  const handlePageCreation = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void,
    fixedPath?: string
  ) => {
    try {
      setIsCreating(true);
      
      // Add translation safeguard
      const originalNoTranslationValue = document.body.getAttribute('data-no-translation');
      
      // CRITICAL: Force disable translations during page creation
      document.body.setAttribute('data-no-translation', 'true');
      
      let finalPath = fixedPath;
      
      // If no fixed path is provided, generate one from the title
      if (!finalPath) {
        const sanitizedTitle = values.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
        
        finalPath = values.pageType === "submenu" && values.parentPath
          ? `${values.parentPath}/${sanitizedTitle}`
          : `/${sanitizedTitle}`;
      }
      
      // Save only Italian version - no automatic translation
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
      
      // Refresh page list
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!fetchError && pagesData) {
        onPageCreated(pagesData);
      }
      
      onSuccess();
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    } finally {
      setIsCreating(false);
      // Keep translation disabled to prevent any automatic translation
      document.body.setAttribute('data-no-translation', 'true');
    }
  };

  /**
   * Avvia manualmente la traduzione di una pagina
   */
  const handleManualTranslation = async (
    content: string,
    title: string,
    finalPath: string,
    imageUrl: string | null,
    icon: string,
    pageType: PageType,
    parentPath: string | null,
    pageImages: ImageItem[]
  ) => {
    try {
      await translatePages(
        content,
        title,
        finalPath,
        imageUrl,
        icon,
        pageType,
        parentPath,
        pageImages
      );
      
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!fetchError && pagesData) {
        onPageCreated(pagesData);
        toast.success("Traduzioni completate con successo");
      }
    } catch (error) {
      console.error("Errore durante la traduzione:", error);
      toast.error("Errore durante la traduzione delle pagine");
    }
  };

  return {
    isCreating,
    isTranslating,
    handlePageCreation,
    handleManualTranslation,
    deletePageAndTranslations
  };
};
