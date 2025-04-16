
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
   * ⚠️ IMPORTANTE: Questa funzione viene chiamata SOLO quando l'utente clicca su "Salva Pagina"
   * È l'UNICO punto in cui viene avviata la traduzione
   * La traduzione NON deve MAI essere avviata in nessun altro punto dell'applicazione
   */
  const handleTranslateAndCreate = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      setIsCreating(true);
      
      // Crea il percorso in base al tipo di pagina
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      let finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;

      // CRITICAL: Set a flag to indicate that automatic translations should be disabled
      document.body.setAttribute('data-no-translation', 'true');
      
      console.log("CREAZIONE PAGINA INIZIATA - Solo versione italiana");
      console.log("⚠️ LA TRADUZIONE SARÀ AVVIATA SOLO DOPO IL SALVATAGGIO DELLA PAGINA ITALIANA");
      
      // Salva solo la versione italiana prima
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

      // EXPLICIT USER CHOICE: Only translate after Italian page save and ONLY if the user explicitly chose to translate
      const userConfirmedTranslation = window.confirm(
        "Vuoi tradurre automaticamente questa pagina in altre lingue? Clicca 'Annulla' per saltare la traduzione."
      );
      
      // Only proceed with translations if user confirmed
      if (pageId && userConfirmedTranslation) {
        console.log("INIZIO TRADUZIONE PAGINA - Su richiesta utente dopo salvataggio");
        try {
          // Remove the no-translation flag ONLY for the translation operation
          document.body.removeAttribute('data-no-translation');
          
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
          
          // Re-enable the no-translation flag after translations
          document.body.setAttribute('data-no-translation', 'true');
          
          const { data: pagesData, error: fetchError } = await supabase
            .from('custom_pages')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fetchError) throw fetchError;
          
          if (pagesData) {
            onPageCreated(pagesData);
            toast.success("Traduzioni completate con successo");
          }
        } catch (translationError) {
          console.error("Errore durante la traduzione:", translationError);
          toast.error("Errore durante la traduzione delle pagine");
        } finally {
          // Make sure the no-translation flag is reset after all operations
          document.body.setAttribute('data-no-translation', 'true');
        }
      } else {
        toast.info("Traduzione automatica saltata su richiesta dell'utente");
        
        // Still refresh the pages list
        const { data: pagesData, error: fetchError } = await supabase
          .from('custom_pages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!fetchError && pagesData) {
          onPageCreated(pagesData);
        }
      }
      
      // Call the success callback regardless of translation
      onSuccess();
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    } finally {
      setIsCreating(false);
      // Ensure the no-translation flag is reset
      document.body.setAttribute('data-no-translation', 'true');
    }
  };

  return {
    isCreating,
    isTranslating,
    handleTranslateAndCreate,
    deletePageAndTranslations
  };
};
