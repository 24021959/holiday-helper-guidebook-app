
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/pages/Admin";
import { useNavigate } from "react-router-dom";
import { EditPageForm } from "./EditPageForm";
import { PageListItem } from "./PageListItem";
import { Loader2 } from "lucide-react";

interface ManagePagesViewProps {
  pages: PageData[];
  onPagesUpdate: (pages: PageData[]) => void;
  parentPages: PageData[];
  keywordToIconMap: Record<string, string>;
}

export const ManagePagesView: React.FC<ManagePagesViewProps> = ({ 
  pages, 
  onPagesUpdate,
  parentPages,
  keywordToIconMap
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (pages) {
      setIsLoading(false);
    }
  }, [pages]);

  const handleDeletePage = async (id: string) => {
    try {
      const pageToDelete = pages.find(page => page.id === id);
      if (!pageToDelete) return;
      
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      
      if (pageError) throw pageError;
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .delete()
        .eq('path', pageToDelete.path);
      
      if (iconError) throw iconError;
      
      if (!pageToDelete.isSubmenu) {
        const subPages = pages.filter(page => page.parentPath === pageToDelete.path);
        
        for (const subPage of subPages) {
          await supabase.from('custom_pages').delete().eq('id', subPage.id);
          await supabase.from('menu_icons').delete().eq('path', subPage.path);
        }
      }
      
      const updatedPages = pages.filter(page => page.id !== id);
      onPagesUpdate(updatedPages);
      
      toast.info("Pagina eliminata");
    } catch (error) {
      console.error("Errore nell'eliminare la pagina:", error);
      toast.error("Errore nell'eliminare la pagina");
    }
  };

  const handleEditPage = (page: PageData) => {
    setSelectedPage(page);
    setIsEditDialogOpen(true);
  };

  const handlePageUpdated = (updatedPage: PageData) => {
    const updatedPages = pages.map(p => 
      p.id === updatedPage.id ? updatedPage : p
    );
    onPagesUpdate(updatedPages);
    setIsEditDialogOpen(false);
    toast.success("Pagina aggiornata con successo");
  };

  const handlePreviewPage = (path: string) => {
    navigate(`/preview/${path}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="ml-2 text-emerald-600">Caricamento pagine...</p>
      </div>
    );
  }

  // Ordina le pagine per titolo
  const sortedPages = [...pages].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-medium text-emerald-600">Gestisci Pagine</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tutte le pagine create sono automaticamente visibili nel menu principale
        </p>
      </div>
      
      {sortedPages.length === 0 ? (
        <p className="text-gray-500">Nessuna pagina creata finora</p>
      ) : (
        <div className="space-y-4">
          {sortedPages.map((page) => (
            <PageListItem
              key={page.id}
              page={page}
              onDelete={handleDeletePage}
              onEdit={handleEditPage}
              onPreview={handlePreviewPage}
            />
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Pagina: {selectedPage?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedPage && (
            <EditPageForm 
              page={selectedPage}
              parentPages={parentPages}
              onPageUpdated={handlePageUpdated}
              onFormClose={() => setIsEditDialogOpen(false)}
              keywordToIconMap={keywordToIconMap}
              isSystemPage={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
