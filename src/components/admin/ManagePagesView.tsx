
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/pages/Admin";
import { useNavigate } from "react-router-dom";
import { EditPageForm } from "./EditPageForm";
import { PageListItem } from "./PageListItem";
import { Loader2, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showUnpublished, setShowUnpublished] = useState(false);

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

  const handleTogglePublish = async (page: PageData) => {
    try {
      const newPublishedState = !page.published;
      
      console.log(`Pubblicazione pagina: ${page.title}. Nuovo stato: ${newPublishedState ? 'Pubblicata' : 'Bozza'}`);
      
      // Update published state in custom_pages table
      const { error: pageError } = await supabase
        .from('custom_pages')
        .update({ published: newPublishedState })
        .eq('id', page.id);
      
      if (pageError) {
        console.error("Errore nell'aggiornare la tabella custom_pages:", pageError);
        throw pageError;
      }
      
      // Check if icon exists for this page
      const { data: existingIcon, error: iconCheckError } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('path', page.path)
        .maybeSingle();
      
      if (iconCheckError && iconCheckError.code !== 'PGRST116') {
        console.error("Errore nel controllare se esiste già l'icona:", iconCheckError);
        throw iconCheckError;
      }
      
      // If icon exists, update published state
      if (existingIcon) {
        console.log(`Aggiornamento icona esistente per ${page.path} - Stato pubblicazione: ${newPublishedState}`);
        const { error: iconUpdateError } = await supabase
          .from('menu_icons')
          .update({ published: newPublishedState })
          .eq('path', page.path);
        
        if (iconUpdateError) {
          console.error("Errore nell'aggiornare l'icona del menu:", iconUpdateError);
          throw iconUpdateError;
        }
      } 
      // If icon doesn't exist, create it
      else {
        console.log(`Creazione nuova icona per ${page.path} - Stato pubblicazione: ${newPublishedState}`);
        const { error: iconCreateError } = await supabase
          .from('menu_icons')
          .insert({
            path: page.path,
            icon: page.icon || 'FileText',
            label: page.title,
            published: newPublishedState,
            parent_path: page.parentPath || null,
            is_submenu: page.isSubmenu || false,
            bg_color: 'bg-emerald-100'
          });
        
        if (iconCreateError) {
          console.error("Errore nella creazione dell'icona del menu:", iconCreateError);
          throw iconCreateError;
        }
      }
      
      // Update local state
      const updatedPages = pages.map(p => 
        p.id === page.id ? { ...p, published: newPublishedState } : p
      );
      
      onPagesUpdate(updatedPages);
      
      toast.success(newPublishedState 
        ? "Pagina pubblicata con successo! Torna al menu e clicca 'Aggiorna'" 
        : "Pagina nascosta dal menu");
        
    } catch (error) {
      console.error("Errore nell'aggiornare lo stato di pubblicazione:", error);
      toast.error("Errore nell'aggiornare lo stato di pubblicazione");
    }
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

  const filteredPages = showUnpublished 
    ? [...pages] 
    : pages.filter(page => page.published);
    
  const sortedPages = [...filteredPages].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-emerald-600">Gestisci Pagine</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowUnpublished(!showUnpublished)}
          className="flex items-center gap-2"
        >
          {showUnpublished ? <Eye size={16} /> : <EyeOff size={16} />}
          {showUnpublished ? "Mostra tutte" : "Mostra anche bozze"}
        </Button>
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
              onTogglePublish={handleTogglePublish}
              isSystemPage={false}
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
