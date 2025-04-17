
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { LanguageTabs } from "./LanguageTabs";
import { LanguageInfoBanner } from "./LanguageInfoBanner";
import { PagesList } from "./PagesList";
import { DeletePageDialog } from "./DeletePageDialog";
import { usePageTranslation } from "@/hooks/page/usePageTranslation";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  const confirmDelete = async (): Promise<void> => {
    if (deletingPage) {
      onDeletePage(deletingPage);
      setShowDeleteDialog(false);
      setDeletingPage(null);
    }
  };

  const handleTranslate = (page: PageData) => {
    setTranslatingPage(page);
    setShowTranslateDialog(true);
  };

  const confirmTranslation = async () => {
    if (!translatingPage) return;
    
    try {
      // Se è selezionata una singola lingua
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
        // Se sono selezionate tutte le lingue
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
      }
      
      setShowTranslateDialog(false);
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

      <Dialog open={showTranslateDialog} onOpenChange={setShowTranslateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traduci pagina</DialogTitle>
            <DialogDescription>
              {isTranslatingAll 
                ? "La pagina verrà tradotta in tutte le lingue (EN, FR, ES, DE) in sequenza" 
                : `Scegli in quale lingua vuoi tradurre la pagina "${translatingPage?.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 my-4">
            {!isTranslatingAll && (
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={targetLanguage === "en" ? "default" : "outline"}
                  onClick={() => setTargetLanguage("en")}
                  className={targetLanguage === "en" ? "border-2 border-blue-600" : ""}
                >
                  🇬🇧 English
                </Button>
                <Button 
                  variant={targetLanguage === "fr" ? "default" : "outline"}
                  onClick={() => setTargetLanguage("fr")}
                  className={targetLanguage === "fr" ? "border-2 border-blue-600" : ""}
                >
                  🇫🇷 Français
                </Button>
                <Button 
                  variant={targetLanguage === "es" ? "default" : "outline"}
                  onClick={() => setTargetLanguage("es")}
                  className={targetLanguage === "es" ? "border-2 border-blue-600" : ""}
                >
                  🇪🇸 Español
                </Button>
                <Button 
                  variant={targetLanguage === "de" ? "default" : "outline"}
                  onClick={() => setTargetLanguage("de")}
                  className={targetLanguage === "de" ? "border-2 border-blue-600" : ""}
                >
                  🇩🇪 Deutsch
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setIsTranslatingAll(!isTranslatingAll)}
              className={isTranslatingAll ? "bg-amber-100 border-amber-400 text-amber-800" : ""}
            >
              {isTranslatingAll 
                ? "✅ Tradurre in tutte le lingue (sequenzialmente)" 
                : "Tradurre in tutte le lingue (sequenzialmente)"}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTranslateDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={confirmTranslation}
              disabled={isTranslating}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isTranslating ? "Traduzione in corso..." : "Traduci"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
