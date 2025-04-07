
import React, { useState, useEffect, useCallback } from "react";
import { PageData } from "@/pages/Admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageListItem } from "./PageListItem";
import { CreatePageForm } from "./CreatePageForm";
import EditPageForm from "./EditPageForm";
import { PlusCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

interface ManagePagesViewProps {
  pages: PageData[];
  onPagesUpdate: (updatedPages: PageData[]) => void;
  parentPages: PageData[];
  keywordToIconMap: Record<string, string>;
}

const ManagePagesView: React.FC<ManagePagesViewProps> = ({ 
  pages,
  onPagesUpdate,
  parentPages,
  keywordToIconMap
}) => {
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ManagePagesView - refreshTrigger aggiornato:", refreshTrigger);
  }, [refreshTrigger]);

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (fetchError) {
        console.error("Errore nel recupero delle pagine:", fetchError);
        throw fetchError;
      }
      
      if (pagesData) {
        const formattedPages = pagesData.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined,
          pageImages: [],
          published: page.published
        }));
        
        onPagesUpdate(formattedPages);
        toast.success("Pagine aggiornate con successo");
      }
    } catch (error) {
      console.error("Errore nel recupero delle pagine:", error);
      setError("Impossibile recuperare le pagine. Riprova più tardi.");
      toast.error("Errore nel recupero delle pagine");
    } finally {
      setIsLoading(false);
    }
  }, [onPagesUpdate]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPages();
    }
  }, [refreshTrigger, fetchPages]);

  const handlePageCreated = (newPages: PageData[]) => {
    onPagesUpdate(newPages);
    setIsCreateMode(false);
    setSelectedPage(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageUpdated = (updatedPages: PageData[]) => {
    onPagesUpdate(updatedPages);
    setSelectedPage(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageDelete = async (pageId: string) => {
    try {
      setIsLoading(true);
      
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', pageId);
      
      if (pageError) {
        console.error("Errore nella cancellazione della pagina:", pageError);
        throw pageError;
      }
      
      const pageToDelete = pages.find(p => p.id === pageId);
      if (pageToDelete) {
        const { error: iconError } = await supabase
          .from('menu_icons')
          .delete()
          .eq('path', pageToDelete.path);
        
        if (iconError) {
          console.error("Errore nella cancellazione dell'icona:", iconError);
        }
      }
      
      // Refresh pages list
      await fetchPages();
      
    } catch (error) {
      console.error("Errore nella cancellazione della pagina:", error);
      toast.error("Errore nella cancellazione della pagina");
    } finally {
      setIsLoading(false);
    }
  };

  // Preview handler
  const handlePagePreview = (path: string) => {
    window.open(`/preview${path}`, '_blank');
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Aggiornamento pagine in corso...");
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-700 mb-2">Errore di connessione</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRefresh}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">Gestisci Pagine</h1>
        <div className="space-x-2">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button 
            onClick={() => {
              setIsCreateMode(true);
              setSelectedPage(null);
            }}
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Nuova Pagina
          </Button>
        </div>
      </div>

      <Tabs defaultValue={selectedPage ? "edit" : isCreateMode ? "create" : "list"} className="w-full">
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
              <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
              <span className="ml-3 text-emerald-700">Caricamento pagine...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.length === 0 ? (
                <div className="col-span-full bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <p className="text-amber-700 mb-4">Nessuna pagina creata finora</p>
                  <Button 
                    onClick={() => {
                      setIsCreateMode(true);
                      setSelectedPage(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crea Prima Pagina
                  </Button>
                </div>
              ) : (
                pages.map((page) => (
                  <PageListItem
                    key={page.id}
                    page={page}
                    onEdit={() => {
                      setSelectedPage(page);
                      setIsCreateMode(false);
                    }}
                    onDelete={handlePageDelete}
                    onPreview={handlePagePreview}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>
        
        {selectedPage && (
          <TabsContent value="edit">
            <EditPageForm 
              selectedPage={selectedPage}
              parentPages={parentPages}
              onPageUpdated={handlePageUpdated}
              keywordToIconMap={keywordToIconMap}
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
    </div>
  );
};

export default ManagePagesView;
