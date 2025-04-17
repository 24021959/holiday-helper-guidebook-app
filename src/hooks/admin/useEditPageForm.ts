
import { useState } from "react";
import { PageData } from "@/types/page.types";
import { usePageCreation } from "@/hooks/usePageCreation";
import { ImageItem } from "@/types/image.types";
import { toast } from "sonner";
import { uploadImage } from "@/integrations/supabase/storage";
import { Language } from "@/types/translation.types";

// Helper function to extract language from path
const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

interface UseEditPageFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (pages: PageData[]) => void;
}

export const useEditPageForm = ({ 
  selectedPage, 
  parentPages, 
  onPageUpdated 
}: UseEditPageFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(selectedPage.imageUrl || null);
  const [lastSavedValues, setLastSavedValues] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);
  
  // Extract current language from the path
  const currentLanguage = getLanguageFromPath(selectedPage.path);
  
  const { handlePageCreation, isCreating, isTranslating, handleManualTranslation } = usePageCreation({ 
    onPageCreated: onPageUpdated 
  });

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

  const handleFormSubmit = async (values: any, pageImages: ImageItem[]) => {
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
      
      // For home page, maintain the same path
      const isHomePage = selectedPage.path === "/" || selectedPage.path.endsWith("/home");
      const finalPath = isHomePage ? selectedPage.path : undefined;
      
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
        },
        finalPath // Pass the original path for home page
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

      const targetLanguages: Language[] = ["en", "fr", "es", "de"];

      await handleManualTranslation(
        lastSavedValues.content,
        lastSavedValues.title,
        finalPath,
        lastSavedValues.mainImage,
        lastSavedValues.icon,
        lastSavedValues.pageType,
        lastSavedValues.pageType === "submenu" ? lastSavedValues.parentPath : null,
        lastSavedValues.pageImages,
        targetLanguages
      );
    } catch (error) {
      console.error("Error during translation:", error);
      toast.error("Errore durante la traduzione");
    }
  };

  const handlePreview = (content: React.ReactNode) => {
    setPreviewContent(content);
    setPreviewOpen(true);
  };

  return {
    isSubmitting,
    mainImage,
    currentLanguage,
    lastSavedValues,
    isCreating,
    isTranslating,
    previewOpen,
    setPreviewOpen,
    previewContent,
    handleMainImageUpload,
    handleMainImageRemove,
    handleFormSubmit,
    handleManualTranslate,
    handlePreview
  };
};
