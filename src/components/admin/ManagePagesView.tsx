
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/pages/Admin";
import { useNavigate } from "react-router-dom";
import { EditPageForm } from "./EditPageForm";
import { PageListItem } from "./PageListItem";

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
    // Ensure pages are loaded
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
  };

  const handlePreviewPage = (path: string) => {
    navigate(`/preview/${path}`);
  };

  if (isLoading) {
    return <p className="text-gray-500">Caricamento pagine...</p>;
  }

  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Gestisci Pagine</h2>
      
      {pages.length === 0 ? (
        <p className="text-gray-500">Nessuna pagina creata finora</p>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
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

      {/* Edit Page Dialog */}
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
              keywordToIconMap={keywordToIconMap}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
