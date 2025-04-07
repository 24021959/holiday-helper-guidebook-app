
import React, { useState, useEffect } from "react";
import { PageData } from "@/pages/Admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageListItem } from "./PageListItem";  // Fixed import
import { CreatePageForm } from "./CreatePageForm";
import EditPageForm from "./EditPageForm";
import { PlusCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";  // Fixed import

interface ManagePagesViewProps {
  initialPages: PageData[];
}

const ManagePagesView: React.FC<ManagePagesViewProps> = ({ initialPages }) => {
  const [pages, setPages] = useState<PageData[]>(initialPages);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const keywordToIconMap = useKeywordToIconMap();

  useEffect(() => {
    console.log("ManagePagesView - refreshTrigger aggiornato:", refreshTrigger);
  }, [refreshTrigger]);

  const handlePageCreated = (newPages: PageData[]) => {
    setPages(newPages);
    setIsCreateMode(false);
    setSelectedPage(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageUpdated = (updatedPages: PageData[]) => {
    setPages(updatedPages);
    setSelectedPage(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageDelete = async (pageId: string) => {
    try {
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', pageId);
      
      if (pageError) {
        console.error("Errore nella cancellazione della pagina:", pageError);
        throw pageError;
      }
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .delete()
        .eq('path', pages.find(p => p.id === pageId)?.path);
      
      if (iconError) {
        console.error("Errore nella cancellazione dell'icona:", iconError);
      }
      
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
        
        setPages(formattedPages);
        toast.success("Pagina cancellata con successo");
        setSelectedPage(null);
        setRefreshTrigger(prev => prev + 1);
      }
      
    } catch (error) {
      console.error("Errore nella cancellazione della pagina:", error);
      toast.error("Errore nella cancellazione della pagina");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">Gestisci Pagine</h1>
        <div className="space-x-2">
          <Button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Aggiorna
          </Button>
          <Button onClick={() => setIsCreateMode(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Nuova Pagina
          </Button>
        </div>
      </div>

      <Tabs defaultValue={selectedPage ? "edit" : "create"} className="w-full">
        <TabsList className="mb-4">
          {selectedPage && (
            <TabsTrigger value="edit">Modifica Pagina</TabsTrigger>
          )}
          {isCreateMode && (
            <TabsTrigger value="create">Crea Pagina</TabsTrigger>
          )}
        </TabsList>
        
        {selectedPage && (
          <TabsContent value="edit">
            <EditPageForm 
              selectedPage={selectedPage}
              parentPages={pages}
              onPageUpdated={handlePageUpdated}
              keywordToIconMap={keywordToIconMap}
            />
          </TabsContent>
        )}
        
        {isCreateMode && (
          <TabsContent value="create">
            <CreatePageForm
              parentPages={pages}
              onPageCreated={handlePageCreated}
              keywordToIconMap={keywordToIconMap}
            />
          </TabsContent>
        )}
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <PageListItem
            key={page.id}
            page={page}
            onEdit={() => {
              setSelectedPage(page);
              setIsCreateMode(false);
            }}
            onDelete={handlePageDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ManagePagesView;
