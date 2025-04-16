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

  // Extract current language from the path
  const currentLanguage = getLanguageFromPath(selectedPage.path);
  console.log(`Editing page in language: ${currentLanguage}`);

  const { handleTranslateAndCreate } = usePageCreation({ 
    onPageCreated: onPageUpdated 
  });

  // Get filtered parent pages for the current language
  const filteredParentPages = parentPages.filter(page => {
    const pageLanguage = getLanguageFromPath(page.path);
    return pageLanguage === currentLanguage;
  });

  // Wrapper to adapt the function signature of handleTranslateAndCreate
  const handleFormSubmit = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      // If we're editing a translated version, make sure we keep the language prefix in parent path
      if (currentLanguage !== 'it' && values.parentPath) {
        // Ensure the parent path has the correct language prefix
        if (!values.parentPath.startsWith(`/${currentLanguage}/`)) {
          values.parentPath = `/${currentLanguage}${values.parentPath.replace(/^\/[a-z]{2}\//, '/')}`;
        }
      }
      
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
      parentPages={filteredParentPages}
      onPageUpdated={onPageUpdated}
      handleTranslateAndCreate={handleFormSubmit}
    />
  );
};

// Helper function to extract language from path
const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

export default EditPageForm;
