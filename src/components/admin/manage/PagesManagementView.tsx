
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { LanguageTabs } from "./LanguageTabs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { IndexCleanupBanner } from "./components/IndexCleanupBanner";

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

  // Delete translated home pages (all except Italian)
  const handleDeleteTranslatedHomePages = async () => {
    try {
      const translatedHomePages = pages.filter(page => {
        return (page.path === '/en/home' || 
                page.path === '/fr/home' || 
                page.path === '/es/home' || 
                page.path === '/de/home');
      });

      if (translatedHomePages.length === 0) {
        toast.info("Non ci sono pagine home tradotte da eliminare");
        return;
      }

      for (const page of translatedHomePages) {
        await onDeletePage(page);
      }

      toast.success(`Eliminate ${translatedHomePages.length} pagine home tradotte`);
    } catch (error) {
      console.error("Error deleting translated home pages:", error);
      toast.error("Errore durante l'eliminazione delle pagine home tradotte");
    }
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

  const hasTranslatedHomePages = pages?.some(page => 
    page.path === '/en/home' || 
    page.path === '/fr/home' || 
    page.path === '/es/home' || 
    page.path === '/de/home'
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Gestione Pagine {currentLanguage === 'it' ? 'in Italiano' : `in ${currentLanguage.toUpperCase()}`}
        </h2>
        <div className="flex items-center gap-4">
          {currentLanguage === 'it' && hasTranslatedHomePages && (
            <Button 
              variant="outline" 
              onClick={handleDeleteTranslatedHomePages}
              className="border-red-200 text-red-600 hover:bg-red-50"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina Home Tradotte
            </Button>
          )}
          <div className="text-sm text-gray-500">
            {filteredPages?.length || 0} pagine trovate
          </div>
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

