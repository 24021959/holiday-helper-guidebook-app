
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { LanguageSelector } from "./LanguageSelector";
import { LanguageInfoBanner } from "./LanguageInfoBanner";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleDeleteClick = (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (page: PageData) => {
    // Navigate to the create page with edit mode enabled and the page data
    navigate(`/admin/create`, { 
      state: { 
        editMode: true, 
        pageToEdit: page 
      } 
    });
  };

  const confirmDelete = async (): Promise<void> => {
    if (deletingPage) {
      onDeletePage(deletingPage);
      setShowDeleteDialog(false);
      setDeletingPage(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestione Pagine</h2>
        <LanguageSelector 
          currentLanguage={currentLanguage} 
          onLanguageChange={onLanguageChange} 
        />
      </div>

      <LanguageInfoBanner currentLanguage={currentLanguage} />

      <PagesList 
        pages={pages}
        onView={onViewPage}
        onDelete={handleDeleteClick}
        onEdit={handleEditClick}
        isDeleting={isDeleting}
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
