
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { LanguageTabs } from "./LanguageTabs";
import { LanguageInfoBanner } from "./LanguageInfoBanner";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { usePageTranslation } from "@/hooks/page/usePageTranslation";
import { toast } from "sonner";

interface PagesManagementViewProps {
  pages: PageData[];
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  isDeleting: boolean;
  onDeletePage: (page: PageData) => void;
  onViewPage: (page: PageData) => void;
  onEditPage: (page: PageData) => void;
}

export const PagesManagementView: React.FC<PagesManagementViewProps> = ({
  pages,
  currentLanguage,
  onLanguageChange,
  isDeleting,
  onDeletePage,
  onViewPage,
  onEditPage
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPage, setDeletingPage] = useState<PageData | null>(null);
  const { isTranslating, translatePages } = usePageTranslation();

  const handleDeleteClick = (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (deletingPage) {
      onDeletePage(deletingPage);
      setShowDeleteDialog(false);
      setDeletingPage(null);
    }
  };

  const handleTranslate = async (page: PageData) => {
    try {
      toast.info(`Avvio traduzione di "${page.title}" in tutte le lingue...`);
      
      await translatePages(
        page.content,
        page.title,
        page.path,
        page.imageUrl || null,
        page.icon || "FileText",
        page.isSubmenu ? "submenu" : (page.is_parent ? "parent" : "generic"),
        page.parentPath || null,
        page.pageImages || []
      );
      
      toast.success("Pagina tradotta con successo in tutte le lingue");
    } catch (error) {
      console.error("Errore durante la traduzione:", error);
      toast.error("Si è verificato un errore durante la traduzione");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestione Pagine</h2>
        <LanguageTabs 
          currentLanguage={currentLanguage} 
          onLanguageChange={onLanguageChange} 
        />
      </div>

      <LanguageInfoBanner currentLanguage={currentLanguage} />

      <PagesList 
        pages={pages}
        onView={onViewPage}
        onDelete={handleDeleteClick}
        onEdit={onEditPage}
        onTranslate={currentLanguage === 'it' ? handleTranslate : undefined}
        isDeleting={isDeleting}
        currentLanguage={currentLanguage}
      />

      <DeletePageDialog 
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        page={deletingPage}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
};
