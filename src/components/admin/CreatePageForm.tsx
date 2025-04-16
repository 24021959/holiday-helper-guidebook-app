
import React, { useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/integrations/supabase/storage";
import { ImageItem } from "@/types/image.types";
import { useToast } from "@/hooks/use-toast";
import { PageData } from "@/types/page.types";
import { usePageCreation } from "@/hooks/usePageCreation";
import { PageForm } from './form/PageForm';
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
  const { toast } = useToast();
  const { isCreating, isTranslating, handleTranslateAndCreate } = usePageCreation({ onPageCreated });

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
      
      await handleTranslateAndCreate(
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

  const handleCancel = () => {
    setMainImage(null);
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
        submitButtonText="Crea Pagina"
      />
    </div>
  );
};

export default CreatePageForm;
