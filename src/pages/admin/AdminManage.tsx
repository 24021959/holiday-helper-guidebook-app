
import React, { useState, useEffect } from "react";
import { PageData } from "@/types/page.types";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { toast } from "sonner";
import { PagesManagementView } from "@/components/admin/manage/PagesManagementView";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { usePageDeletion } from "@/hooks/page/usePageDeletion";
import { useNavigate } from "react-router-dom";

const AdminManage = () => {
  const [needsIndexCleanup, setNeedsIndexCleanup] = useState(false);
  const navigate = useNavigate();
  
  const {
    pages,
    isLoading,
    isDeleting,
    fetchPages,
    confirmDeletePage
  } = useAdminPages();

  const { deleteIndexPage } = usePageDeletion();

  useEffect(() => {
    // Controllo per la presenza di pagine duplicate (index e home)
    if (pages && pages.length > 0) {
      const indexPage = pages.find(p => p.path === '/');
      const homePage = pages.find(p => p.path === '/home');
      
      if (indexPage && homePage) {
        setNeedsIndexCleanup(true);
      } else {
        setNeedsIndexCleanup(false);
      }
    }
  }, [pages]);

  const handleDeleteIndexPage = async () => {
    try {
      const success = await deleteIndexPage();
      if (success) {
        setNeedsIndexCleanup(false);
        await fetchPages();
        toast.success("Pagina Index eliminata con successo. Ora /home è la pagina principale.");
      }
    } catch (error) {
      console.error("Error deleting index page:", error);
      toast.error("Errore durante l'eliminazione della pagina index");
    }
  };

  const handleRefresh = () => {
    fetchPages();
    toast.info("Aggiornamento lista pagine...");
  };

  const handleView = (page: PageData) => {
    const isHomePath = page.path === "/" || page.path === "/home";
    if (isHomePath) {
      window.open("/", '_blank');
    } else {
      window.open(`/preview${page.path}`, '_blank');
    }
  };

  const handleEdit = (page: PageData) => {
    navigate("/admin/edit", { 
      state: { 
        pageToEdit: page 
      } 
    });
  };

  const handleAddNewPage = () => {
    navigate("/admin/create");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700" 
            onClick={handleAddNewPage}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea nuova pagina
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="border-emerald-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Aggiorna
          </Button>
        </div>
      </div>
      
      {needsIndexCleanup && (
        <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">Rilevate due pagine home</h3>
              <p className="text-amber-700 text-sm mt-1">
                Sono state rilevate sia una pagina Index (/) che una pagina Home (/home). 
                Si consiglia di rimuovere la vecchia pagina Index per evitare confusione.
              </p>
              <Button 
                variant="outline" 
                className="mt-3 bg-white text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={handleDeleteIndexPage}
              >
                Elimina pagina Index (/)
              </Button>
            </div>
          </div>
        </div>
      )}

      <PagesManagementView
        pages={pages || []}
        isDeleting={isDeleting}
        onDeletePage={confirmDeletePage}
        onViewPage={handleView}
        onEditPage={handleEdit}
      />
    </div>
  );
};

export default AdminManage;
