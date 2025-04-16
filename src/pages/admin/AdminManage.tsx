
import React, { useState } from "react";
import { PageData } from "@/types/page.types";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { toast } from "sonner";
import EditPageForm from "@/components/admin/EditPageForm";
import { useRouter } from "@/lib/next-router-mock";
import { PagesManagementView } from "@/components/admin/manage/PagesManagementView";

// Define a mapping of keywords to icons
const keywordToIconMap: Record<string, string> = {
  home: "Home",
  casa: "Home",
  info: "Info",
  informazioni: "Info",
  contatti: "Phone",
  telefono: "Phone",
  email: "Mail",
  menu: "Menu",
  ristorante: "Utensils",
  cibo: "Utensils",
  mappa: "Map",
  posizione: "MapPin",
  eventi: "Calendar",
  gallery: "Image",
  galleria: "Image",
  foto: "Image",
  servizi: "LayoutGrid",
  attività: "Activity",
  attivita: "Activity",
  escursioni: "Mountain",
  sport: "Dumbbell",
  piscina: "Waves",
  spiaggia: "Umbrella",
  mare: "Ship",
  // Default fallback
  default: "FileText"
};

const AdminManage = () => {
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const router = useRouter();
  
  const {
    pages,
    parentPages,
    isLoading,
    currentLanguage,
    setCurrentLanguage,
    isDeleting,
    fetchPages,
    confirmDeletePage
  } = useAdminPages();

  const handleView = (page: PageData) => {
    window.open(`/preview${page.path}`, '_blank');
  };

  const handleEdit = (page: PageData) => {
    setEditingPage(page);
  };

  const handlePageUpdated = async () => {
    await fetchPages(currentLanguage);
    setEditingPage(null);
    toast.success("Pagina aggiornata con successo");
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
      {editingPage ? (
        <EditPageForm 
          selectedPage={editingPage}
          parentPages={parentPages}
          onPageUpdated={handlePageUpdated}
          keywordToIconMap={keywordToIconMap}
          allPages={pages}
        />
      ) : (
        <PagesManagementView
          pages={pages}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          isDeleting={isDeleting}
          onDeletePage={confirmDeletePage}
          onViewPage={handleView}
          onEditPage={handleEdit}
        />
      )}
    </div>
  );
};

export default AdminManage;
