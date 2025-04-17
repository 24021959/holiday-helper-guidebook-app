
import { useState } from "react";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { usePageDeletion } from "../page/usePageDeletion";
import { usePagesQuery } from "./usePagesQuery";

export const useAdminPages = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePageAndTranslations } = usePageDeletion();
  const { pages, parentPages, isLoading, fetchPages } = usePagesQuery();

  const confirmDeletePage = async (pageToDelete: PageData) => {
    if (!pageToDelete) return;
    
    try {
      setIsDeleting(true);
      await deletePageAndTranslations(pageToDelete.path);
      await fetchPages();
      toast.success("Pagina eliminata con successo");
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
    isDeleting,
    fetchPages,
    confirmDeletePage
  };
};
