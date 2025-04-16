
import React, { useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/integrations/supabase/storage";
import { ImageItem } from "@/types/image.types";
import { useToast } from "@/hooks/use-toast";
import { PageData } from "@/types/page.types";
import { usePageCreation } from "@/hooks/usePageCreation";
import { PageForm } from './form/PageForm';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import type { z } from "zod";
import { pageFormSchema } from './schemas/pageFormSchema';

interface CreatePageFormProps {
  parentPages: PageData[];
  onPageCreated: (pages: any[]) => void;
  keywordToIconMap: Record<string, string>;
}

const CreatePageForm: React.FC<CreatePageFormProps> = ({
  parentPages, onPageCreated, keywordToIconMap
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [lastSavedValues, setLastSavedValues] = useState<any>(null);
  const { toast } = useToast();
  const { 
    isCreating, 
    isTranslating, 
    handlePageCreation,
    handleManualTranslation 
  } = usePageCreation({ onPageCreated });

  const handleMainImageUpload = async (file: File) => {
    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage(file);
      setMainImage(imageUrl);
      toast({
        title: "Immagine caricata",
        description: "L'immagine principale è stata caricata con successo",
      });
    } catch (error) {
      console.error("Errore durante il caricamento dell'immagine:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento dell'immagine",
        variant: "destructive",
      });
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
          setMainImage(null);
          // Save values for translation button
          setLastSavedValues({
            content: values.content,
            title: values.title,
            icon: values.icon,
            pageType: values.pageType,
            parentPath: values.parentPath,
            mainImage,
            pageImages
          });
        }
      );
    } catch (error) {
      console.error("Errore durante la creazione della pagina:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della pagina",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async () => {
    if (!lastSavedValues) {
      toast({
        title: "Errore",
        description: "Devi prima salvare la pagina prima di poterla tradurre",
        variant: "destructive",
      });
      return;
    }

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
  };

  const handleCancel = () => {
    setMainImage(null);
    setLastSavedValues(null);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <PageForm
        parentPages={parentPages}
        isCreating={isCreating}
        isTranslating={isTranslating}
        isSubmitting={isSubmitting}
        mainImage={mainImage}
        onMainImageUpload={handleMainImageUpload}
        onMainImageRemove={handleMainImageRemove}
        onCancel={handleCancel}
        onSubmit={handleFormSubmit}
        submitButtonText="Salva Pagina"
      />
      
      {lastSavedValues && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleTranslate}
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

export default CreatePageForm;
