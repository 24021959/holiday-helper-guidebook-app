
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { usePageTranslation } from "@/hooks/page/usePageTranslation";
import { toast } from "sonner";

interface PagesManagementViewProps {
  pages: PageData[];
  isDeleting: boolean;
  onDeletePage: (page: PageData) => void;
  onViewPage: (page: PageData) => void;
  onEditPage: (page: PageData) => void;
}

export const PagesManagementView: React.FC<PagesManagementViewProps> = ({
  pages,
  isDeleting,
  onDeletePage,
  onViewPage,
  onEditPage
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPage, setDeletingPage] = useState<PageData | null>(null);

  const handleDeleteClick = (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestione Pagine</h2>
      </div>

      <PagesList 
        pages={pages}
        onView={onViewPage}
        onDelete={handleDeleteClick}
        onEdit={onEditPage}
        isDeleting={isDeleting}
      />

      <DeletePageDialog 
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        page={deletingPage}
        isDeleting={isDeleting}
        onConfirm={() => {
          if (deletingPage) {
            onDeletePage(deletingPage);
            setShowDeleteDialog(false);
            setDeletingPage(null);
          }
        }}
      />
    </>
  );
};
