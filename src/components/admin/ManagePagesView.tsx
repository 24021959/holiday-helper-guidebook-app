
import React, { useState, useEffect, useCallback } from "react";
import { PageData } from "@/pages/Admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageListItem } from "./PageListItem";
import { CreatePageForm } from "./CreatePageForm";
import EditPageForm from "./EditPageForm";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";
import ErrorView from "../ErrorView";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ManagePagesViewProps {
  pages: PageData[];
  onPagesUpdate: (updatedPages: PageData[]) => void;
  parentPages: PageData[];
  keywordToIconMap: Record<string, string>;
}

// Funzione per trovare l'ID base della pagina senza prefisso lingua
const getLanguageFromPath = (path: string): string | null => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : null;
};

// Funzione per normalizzare un percorso rimuovendo il prefisso lingua
const normalizePath = (path: string): string => {
  return path.replace(/^\/[a-z]{2}/, '');
};

const ManagePagesView: React.FC<ManagePagesViewProps> = ({ 
  pages,
  onPagesUpdate,
  parentPages,
  keywordToIconMap
}) => {
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPages, setLocalPages] = useState<PageData[]>(pages);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null);
  
  // Filtra solo le pagine in italiano o senza prefisso di lingua
  const italianPages = localPages.filter(page => {
    const langPrefix = getLanguageFromPath(page.path);
    return langPrefix === 'it' || !langPrefix;
  });

  // Use pages from props directly and avoid extra fetching
  useEffect(() => {
    console.log("ManagePagesView - pages received from props:", pages.length);
    setLocalPages(pages);
  }, [pages]);

  const handlePageCreated = (newPages: PageData[]) => {
    console.log("ManagePagesView - Page created, new pages count:", newPages.length);
    onPagesUpdate(newPages);
    setLocalPages(newPages);
    setIsCreateMode(false);
    setSelectedPage(null);
    setActiveTab("list");
  };

  const handlePageUpdated = (updatedPages: PageData[]) => {
    console.log("ManagePagesView - Page updated, updated pages count:", updatedPages.length);
    onPagesUpdate(updatedPages);
    setLocalPages(updatedPages);
    setSelectedPage(null);
    setActiveTab("list");
  };

  const confirmPageDelete = (page: PageData) => {
    setPageToDelete(page);
    setDeleteConfirmOpen(true);
  };

  const handlePageDelete = async () => {
    try {
      if (!pageToDelete) return;
      
      setIsLoading(true);
      setDeleteConfirmOpen(false);
      
      // Prima ottieni i dettagli della pagina che stiamo eliminando
      const pageId = pageToDelete.id;
      
      // Ottieni il percorso normalizzato della pagina
      const normalizedPath = normalizePath(pageToDelete.path);
      
      // Trova tutte le pagine correlate (traduzioni)
      const relatedPages = localPages.filter(p => normalizePath(p.path) === normalizedPath);
      const relatedPageIds = relatedPages.map(p => p.id);
      const relatedPaths = relatedPages.map(p => p.path);
      
      console.log(`Eliminazione della pagina e delle sue traduzioni:`, relatedPaths);
      
      // Elimina tutte le pagine correlate
      const { error: pagesError } = await supabase
        .from('custom_pages')
        .delete()
        .in('id', relatedPageIds);
      
      if (pagesError) {
        console.error("Errore nella cancellazione delle pagine:", pagesError);
        throw pagesError;
      }
      
      // Elimina le voci di menu corrispondenti
      const { error: iconsError } = await supabase
        .from('menu_icons')
        .delete()
        .in('path', relatedPaths);
      
      if (iconsError) {
        console.error("Errore nella cancellazione delle icone:", iconsError);
      }
      
      // Update local state after successful deletion
      const updatedPages = localPages.filter(p => !relatedPageIds.includes(p.id));
      setLocalPages(updatedPages);
      onPagesUpdate(updatedPages);
      toast.success("Pagina e tutte le sue traduzioni eliminate con successo");
      
    } catch (error) {
      console.error("Errore nella cancellazione della pagina:", error);
      toast.error("Errore nella cancellazione della pagina");
    } finally {
      setIsLoading(false);
      setPageToDelete(null);
    }
  };

  // Preview handler
  const handlePagePreview = (path: string) => {
    window.open(`/preview${path}`, '_blank');
  };

  // Direct edit handling without intermediate step
  const handleEditPage = (page: PageData) => {
    console.log("Editing page:", page.title);
    setSelectedPage(page);
    setIsCreateMode(false);
    setActiveTab("edit");
  };

  if (error) {
    return (
      <ErrorView
        message={error}
        onRefresh={() => {
          setError(null);
          setIsLoading(false);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">Gestisci Pagine</h1>
        <Button 
          onClick={() => {
            setIsCreateMode(true);
            setSelectedPage(null);
            setActiveTab("create");
          }}
          disabled={isLoading}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Crea Nuova Pagina
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista Pagine</TabsTrigger>
          {selectedPage && (
            <TabsTrigger value="edit">Modifica Pagina</TabsTrigger>
          )}
          {isCreateMode && (
            <TabsTrigger value="create">Crea Pagina</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-emerald-700">Caricamento pagine...</span>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {italianPages.length} pagine in italiano
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {italianPages.length === 0 ? (
                  <div className="col-span-full bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <p className="text-amber-700 mb-4">Nessuna pagina creata finora</p>
                    <Button 
                      onClick={() => {
                        setIsCreateMode(true);
                        setSelectedPage(null);
                        setActiveTab("create");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crea Prima Pagina
                    </Button>
                  </div>
                ) : (
                  // Mostra solo le pagine in italiano
                  italianPages.map((page) => (
                    <PageListItem
                      key={page.id}
                      page={page}
                      onEdit={handleEditPage}
                      onDelete={confirmPageDelete}
                      onPreview={handlePagePreview}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>
        
        {selectedPage && (
          <TabsContent value="edit">
            <EditPageForm 
              selectedPage={selectedPage}
              parentPages={parentPages}
              onPageUpdated={handlePageUpdated}
              keywordToIconMap={keywordToIconMap}
              allPages={localPages}
            />
          </TabsContent>
        )}
        
        {isCreateMode && (
          <TabsContent value="create">
            <CreatePageForm
              parentPages={parentPages}
              onPageCreated={handlePageCreated}
              keywordToIconMap={keywordToIconMap}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Confirmation Dialog for Page Deletion */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Stai per eliminare la pagina "{pageToDelete?.title}" e tutte le sue traduzioni. 
              Questa azione è permanente e non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 my-2">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div className="text-amber-800 text-sm">
                <p>Verranno eliminate anche tutte le traduzioni di questa pagina e le relative voci di menu in tutte le lingue.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handlePageDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePagesView;
