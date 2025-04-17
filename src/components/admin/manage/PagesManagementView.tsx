
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { LanguageTabs } from "./LanguageTabs";
import { LanguageInfoBanner } from "./LanguageInfoBanner";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { usePageTranslation } from "@/hooks/page/usePageTranslation";
import { toast } from "sonner";
import { IndexCleanupBanner } from "./components/IndexCleanupBanner";
import { TranslateDialog } from "./components/TranslateDialog";
import { Language } from "@/types/translation.types";

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
  const { isTranslating, translatePage, translatePageToAllLanguages } = usePageTranslation();
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [translatingPage, setTranslatingPage] = useState<PageData | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language>("en");
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const handleDeleteClick = (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  const handleTranslate = (page: PageData) => {
    setTranslatingPage(page);
    setShowTranslateDialog(true);
  };

  // Correggo la funzione per restituire una Promise
  const confirmTranslation = async (): Promise<void> => {
    if (!translatingPage) return Promise.resolve();
    
    try {
      if (!isTranslatingAll) {
        toast.info(`Avvio traduzione di "${translatingPage.title}" in ${targetLanguage.toUpperCase()}...`);
        
        await translatePage(
          translatingPage.content,
          translatingPage.title,
          translatingPage.path,
          translatingPage.imageUrl || null,
          translatingPage.icon || "FileText",
          translatingPage.isSubmenu ? "submenu" : (translatingPage.is_parent ? "parent" : "generic"),
          translatingPage.parentPath || null,
          translatingPage.pageImages || [],
          targetLanguage
        );
        
        toast.success(`Pagina tradotta con successo in ${targetLanguage.toUpperCase()}`);
      } else {
        const targetLanguages: Language[] = ["en", "fr", "es", "de"];
        
        toast.info(`Avvio traduzione di "${translatingPage.title}" in tutte le lingue...`);
        
        await translatePageToAllLanguages(
          translatingPage.content,
          translatingPage.title,
          translatingPage.path,
          translatingPage.imageUrl || null,
          translatingPage.icon || "FileText",
          translatingPage.isSubmenu ? "submenu" : (translatingPage.is_parent ? "parent" : "generic"),
          translatingPage.parentPath || null,
          translatingPage.pageImages || [],
          targetLanguages
        );
        
        toast.success(`Pagina tradotta con successo in tutte le lingue`);
      }
      
      setShowTranslateDialog(false);
      return Promise.resolve(); // Aggiungo un return esplicito
    } catch (error) {
      console.error("Errore durante la traduzione:", error);
      toast.error("Si è verificato un errore durante la traduzione");
      return Promise.reject(error);
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
        onConfirm={() => {
          if (deletingPage) {
            onDeletePage(deletingPage);
            setShowDeleteDialog(false);
            setDeletingPage(null);
          }
        }}
      />

      <TranslateDialog 
        isOpen={showTranslateDialog}
        onOpenChange={setShowTranslateDialog}
        page={translatingPage}
        isTranslating={isTranslating}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        isTranslatingAll={isTranslatingAll}
        setIsTranslatingAll={setIsTranslatingAll}
        onConfirm={confirmTranslation}
      />
    </>
  );
};
