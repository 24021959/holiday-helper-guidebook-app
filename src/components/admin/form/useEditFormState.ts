
import { useState } from 'react';
import { PageData } from "@/types/page.types";
import { ImageItem } from "@/types/image.types";
import { toast } from "sonner";
import { PageFormValues, PageType } from "@/types/form.types";

interface UseEditFormStateProps {
  selectedPage: PageData;
  handleTranslateAndCreate: (
    values: PageFormValues, 
    imageUrl: string | null, 
    pageImages: ImageItem[], 
    onSuccess: () => void
  ) => Promise<void>;
}

export const useEditFormState = ({ 
  selectedPage, 
  handleTranslateAndCreate 
}: UseEditFormStateProps) => {
  const [currentTab, setCurrentTab] = useState<string>("content");
  const [isTranslating, setIsTranslating] = useState(false);
  const [availableTranslations, setAvailableTranslations] = useState<Record<string, boolean>>({});
  const [selectedIcon, setSelectedIcon] = useState(selectedPage.icon || "FileText");
  const [uploadedImage, setUploadedImage] = useState<string | null>(selectedPage.imageUrl || null);
  
  // Ensure pageImages has the correct format with type and width
  const initialPageImages = selectedPage.pageImages 
    ? selectedPage.pageImages.map(img => ({
        url: img.url,
        position: img.position,
        caption: img.caption || "",
        type: "image" as const,
        width: "100%"
      }))
    : [];
  
  const [pageImages, setPageImages] = useState<ImageItem[]>(initialPageImages);
  
  const initialPageType = selectedPage.is_parent 
    ? "parent" as const 
    : selectedPage.isSubmenu 
      ? "submenu" as const 
      : "normal" as const;
      
  const [pageType, setPageType] = useState<PageType>(initialPageType);
  const [parentPath, setParentPath] = useState<string>(selectedPage.parentPath || "");

  const handleFormSubmit = async (formValues: any) => {
    const formattedValues: PageFormValues = {
      title: formValues.title,
      content: formValues.content || "",
      icon: selectedIcon,
      pageType: pageType,
      parentPath: parentPath
    };
    
    try {
      await handleTranslateAndCreate(
        formattedValues,
        uploadedImage,
        pageImages,
        () => {
          toast.success("Modifiche salvate con successo");
        }
      );
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast.error("Errore durante il salvataggio delle modifiche");
    }
  };

  const handleImageInsertion = (imageId: number) => {
    if (imageId >= 0 && imageId < pageImages.length) {
      const updatedImages = [...pageImages];
      updatedImages[imageId] = {
        ...updatedImages[imageId],
        insertInContent: true,
        order: updatedImages.filter(img => img.insertInContent).length
      };
      setPageImages(updatedImages);
      setCurrentTab("images");
      toast.success("Immagine impostata per l'inserimento nel contenuto");
    }
  };

  const handlePageImagesChange = (newImages: ImageItem[]) => {
    setPageImages(newImages);
  };

  return {
    currentTab,
    setCurrentTab,
    isTranslating,
    availableTranslations,
    selectedIcon,
    setSelectedIcon,
    uploadedImage,
    setUploadedImage,
    pageImages,
    setPageImages,
    pageType,
    setPageType,
    parentPath,
    setParentPath,
    handleFormSubmit,
    handleImageInsertion,
    handlePageImagesChange,
    initialPageType
  };
};
