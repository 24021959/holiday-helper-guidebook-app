import React, { useState } from 'react';
import { PageData } from "@/types/page.types";
import { usePageCreation } from "@/hooks/usePageCreation";
import { ImageItem } from "@/types/image.types";
import { PageFormValues, PageType } from "@/types/form.types";
import { toast } from "sonner";
import { uploadImage } from "@/integrations/supabase/storage";
import { pageFormSchema } from './schemas/pageFormSchema';
import { z } from "zod";
import { PageForm } from './form/PageForm';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface EditPageFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
  allPages?: PageData[];
}

// Helper function to extract language from path
const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(selectedPage.imageUrl || null);

  // Extract current language from the path
  const currentLanguage = getLanguageFromPath(selectedPage.path);
  console.log(`Editing page in language: ${currentLanguage}`);

  const [lastSavedValues, setLastSavedValues] = useState<any>(null);
  const { handlePageCreation, isCreating, isTranslating, handleManualTranslation } = usePageCreation({ 
    onPageCreated: onPageUpdated 
  });

  // Get filtered parent pages for the current language
  const filteredParentPages = parentPages.filter(page => {
    const pageLanguage = getLanguageFromPath(page.path);
    return pageLanguage === currentLanguage;
  });

  // Initialize values from selectedPage
  const initialValues = {
    title: selectedPage.title,
    content: selectedPage.content,
    icon: selectedPage.icon || "FileText",
    pageType: (selectedPage.is_parent ? "parent" : selectedPage.isSubmenu ? "submenu" : "normal") as PageType,
    parentPath: selectedPage.parentPath,
  };

  const handleMainImageUpload = async (file: File) => {
    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage(file);
      setMainImage(imageUrl);
      toast.success("Immagine principale caricata con successo");
    } catch (error) {
      console.error("Errore durante il caricamento dell'immagine:", error);
      toast.error("Errore durante il caricamento dell'immagine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMainImageRemove = () => {
    setMainImage(null);
  };

  const handleFormSubmit = async (values: z.infer<typeof pageFormSchema>, pageImages: ImageItem[]) => {
    try {
      setIsSubmitting(true);
      
      if (currentLanguage !== 'it' && values.parentPath) {
        if (!values.parentPath.startsWith(`/${currentLanguage}/`)) {
          values.parentPath = `/${currentLanguage}${values.parentPath.replace(/^\/[a-z]{2}\//, '/')}`;
        }
      }
      
      // Save the values for translation
      setLastSavedValues({
        content: values.content,
        title: values.title,
        icon: values.icon || "FileText",
        pageType: values.pageType,
        parentPath: values.parentPath,
        mainImage,
        pageImages
      });
      
      await handlePageCreation(
        { 
          title: values.title, 
          content: values.content || "", 
          icon: values.icon || "FileText",
          pageType: values.pageType,
          parentPath: values.parentPath
        },
        mainImage,
        pageImages,
        () => {
          toast.success("Modifiche salvate con successo");
        }
      );
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Si è verificato un errore durante il salvataggio della pagina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualTranslate = async () => {
    if (!lastSavedValues) {
      toast.error("Devi prima salvare la pagina prima di poterla tradurre");
      return;
    }

    try {
      const sanitizedTitle = lastSavedValues.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const finalPath = lastSavedValues.pageType === "submenu" && lastSavedValues.parentPath
        ? `${lastSavedValues.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;

      await handleManualTranslation(
        lastSavedValues.content,
        lastSavedValues.title,
        finalPath,
        lastSavedValues.mainImage,
        lastSavedValues.icon,
        lastSavedValues.pageType,
        lastSavedValues.pageType === "submenu" ? lastSavedValues.parentPath : null,
        lastSavedValues.pageImages
      );
    } catch (error) {
      console.error("Error during translation:", error);
      toast.error("Errore durante la traduzione");
    }
  };

  const handleCancel = () => {
    // Just close or reset the form
  };

  return (
    <div className="container max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Modifica Pagina</h2>
      
      <PageForm
        initialValues={{
          title: selectedPage.title,
          content: selectedPage.content,
          icon: selectedPage.icon || "FileText",
          pageType: selectedPage.is_parent ? "parent" : selectedPage.isSubmenu ? "submenu" : "normal",
          parentPath: selectedPage.parentPath,
        }}
        parentPages={parentPages.filter(page => page.id !== selectedPage.id)}
        isCreating={isCreating}
        isTranslating={isTranslating}
        isSubmitting={isSubmitting}
        mainImage={mainImage}
        onMainImageUpload={handleMainImageUpload}
        onMainImageRemove={handleMainImageRemove}
        onCancel={handleCancel}
        onSubmit={handleFormSubmit}
        submitButtonText="Salva Modifiche"
      />

      {lastSavedValues && currentLanguage === 'it' && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleManualTranslate}
            disabled={isTranslating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Globe className="w-4 h-4 mr-2" />
            {isTranslating ? "Traduzione in corso..." : "Traduci la pagina"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditPageForm;
