
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPages, setLocalPages] = useState<PageData[]>(pages);
  const [activeTab, setActiveTab] = useState<string>("list");

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
      
      const pageToDelete = localPages.find(p => p.id === pageId);
      if (pageToDelete) {
        console.log("Deleting menu icon for path:", pageToDelete.path);
        const { error: iconError } = await supabase
          .from('menu_icons')
          .delete()
          .eq('path', pageToDelete.path);
        
        if (iconError) {
          console.error("Errore nella cancellazione dell'icona:", iconError);
        }
      }
      
      // Update local state after successful deletion
      const updatedPages = localPages.filter(p => p.id !== pageId);
      setLocalPages(updatedPages);
      onPagesUpdate(updatedPages);
      toast.success("Pagina eliminata con successo");
      
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localPages.length === 0 ? (
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
                localPages.map((page) => (
                  <PageListItem
                    key={page.id}
                    page={page}
                    onEdit={handleEditPage}
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
