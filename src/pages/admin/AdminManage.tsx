
import React, { useState, useEffect } from "react";
import { PageData } from "@/types/page.types";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { toast } from "sonner";
import { PagesManagementView } from "@/components/admin/manage/PagesManagementView";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
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
    const success = await deleteIndexPage();
    if (success) {
      setNeedsIndexCleanup(false);
      await fetchPages();
      toast.success("Pagina Index eliminata con successo. Ora /home è la pagina principale.");
    }
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
    console.log("Navigating to edit page:", page.title);
    navigate("/admin/edit", { 
      state: { 
        pageToEdit: page 
      } 
    });
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
      {needsIndexCleanup && (
        <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
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
                <Trash2 className="h-4 w-4 mr-2" /> 
                Elimina pagina Index (/)
              </Button>
            </div>
          </div>
        </div>
      )}

      <PagesManagementView
        pages={pages}
        isDeleting={isDeleting}
        onDeletePage={confirmDeletePage}
        onViewPage={handleView}
        onEditPage={handleEdit}
      />
    </div>
  );
};

export default AdminManage;
