
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { LanguageTabs } from "./LanguageTabs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PagesManagementViewProps {
  pages: PageData[];
  isDeleting: boolean;
  onDeletePage: (page: PageData) => Promise<void>;
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
  const [currentLanguage, setCurrentLanguage] = useState('it');

  const handleDeleteClick = (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  // Filtraggio pagine in base alla lingua selezionata
  const filteredPages = pages?.filter(p => {
    if (currentLanguage === 'it') {
      return !p.path.startsWith('/en/') && 
             !p.path.startsWith('/fr/') && 
             !p.path.startsWith('/es/') && 
             !p.path.startsWith('/de/');
    }
    
    return p.path.startsWith(`/${currentLanguage}/`);
  });

  const languageLabels: Record<string, string> = {
    'it': 'Italiano',
    'en': 'Inglese',
    'fr': 'Francese',
    'es': 'Spagnolo',
    'de': 'Tedesco'
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Gestione Pagine in {languageLabels[currentLanguage]}
        </h2>
        <div className="text-sm text-gray-500">
          {filteredPages?.length || 0} pagine trovate
        </div>
      </div>

      <LanguageTabs 
        currentLanguage={currentLanguage} 
        onLanguageChange={setCurrentLanguage} 
      />

      <PagesList 
        pages={filteredPages || []}
        currentLanguage={currentLanguage}
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
        onConfirm={async () => {
          if (deletingPage) {
            await onDeletePage(deletingPage);
            setShowDeleteDialog(false);
            setDeletingPage(null);
          }
        }}
      />
    </>
  );
};
