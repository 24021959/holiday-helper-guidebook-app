
import React from 'react';
import { PageData } from "@/types/page.types";
import { EditForm } from './form/EditForm';
import { usePageCreation } from "@/hooks/usePageCreation";
import { ImageItem } from "@/types/image.types";
import { PageFormValues } from "@/types/form.types";
import { toast } from "sonner";

interface EditPageFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
  allPages?: PageData[];
}

const EditPageForm: React.FC<EditPageFormProps> = ({ 
  selectedPage,
  parentPages,
  onPageUpdated,
  keywordToIconMap,
  allPages = []
}) => {
  // Check for selectedPage before rendering
  if (!selectedPage) {
    console.error("EditPageForm: selectedPage is null or undefined");
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-500">Errore: nessuna pagina selezionata per la modifica</p>
      </div>
    );
  }

  const { handleTranslateAndCreate } = usePageCreation({ 
    onPageCreated: onPageUpdated 
  });

  // Wrapper to adapt the function signature of handleTranslateAndCreate
  const handleFormSubmit = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      return await handleTranslateAndCreate(values, imageUrl, pageImages, onSuccess);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Si è verificato un errore durante il salvataggio della pagina");
      throw error;
    }
  };

  return (
    <EditForm
      selectedPage={selectedPage}
      parentPages={parentPages}
      onPageUpdated={onPageUpdated}
      handleTranslateAndCreate={handleFormSubmit}
    />
  );
};

export default EditPageForm;
