
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import EditPageForm from "@/components/admin/EditPageForm";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pageToEdit } = location.state || {};
  const [selectedPage, setSelectedPage] = useState<PageData | null>(pageToEdit || null);
  const { parentPages, isLoading } = useAdminPages();

  useEffect(() => {
    if (!selectedPage && !pageToEdit) {
      toast.error("Nessuna pagina selezionata per la modifica");
      navigate("/admin/manage");
    } else if (pageToEdit && !selectedPage) {
      setSelectedPage(pageToEdit);
    }
  }, [selectedPage, pageToEdit, navigate]);

  const handlePageUpdated = (pages: PageData[]) => {
    toast.success("Pagina aggiornata con successo");
    navigate("/admin/manage");
  };

  const handleBackClick = () => {
    navigate("/admin/manage");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!selectedPage) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 p-4 rounded-md">
          <h2 className="text-red-600 font-medium text-lg">Errore</h2>
          <p className="text-red-500">Nessuna pagina selezionata per la modifica</p>
          <Button
            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleBackClick}
          >
            Torna alla gestione pagine
          </Button>
        </div>
      </div>
    );
  }

  // Map of keywords to icons, consistent with the admin section
  const keywordToIconMap = {
    home: "Home",
    casa: "Home",
    info: "Info",
    contatti: "Phone",
    telefono: "Phone",
    menu: "Menu",
    ristorante: "Utensils",
    mappa: "Map",
    eventi: "Calendar",
    galleria: "Image",
    servizi: "LayoutGrid",
    default: "FileText",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={handleBackClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla gestione pagine
        </Button>
      </div>

      <EditPageForm
        selectedPage={selectedPage}
        parentPages={parentPages}
        onPageUpdated={handlePageUpdated}
        keywordToIconMap={keywordToIconMap}
      />
    </div>
  );
};

export default EditPage;
