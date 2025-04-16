
import React, { useState } from "react";
import { useRouter } from '@/lib/next-router-mock';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { uploadImage } from "@/integrations/supabase/storage";
import { ImageItem, ImageUploadItem } from "@/types/image.types";
import { useToast } from "@/hooks/use-toast";
import { PageData } from "@/types/page.types";
import { PageType } from "@/types/form.types";
import { PageTypeSection } from "@/components/admin/form/PageTypeSection";
import { usePageCreation } from "@/hooks/usePageCreation";
import { pageFormSchema } from './schemas/pageFormSchema';
import { FormHeader } from './form/FormHeader';
import { SelectedIconDisplay } from './form/SelectedIconDisplay';
import { FormContentSection } from './form/FormContentSection';
import { FormActions } from './form/FormActions';
import type { z } from "zod";

interface CreatePageFormProps {
  parentPages: PageData[];
  onPageCreated: (pages: any[]) => void;
  keywordToIconMap: Record<string, string>;
}

const convertToImageItem = (images: ImageUploadItem[]): ImageItem[] => {
  return images.map(img => ({
    url: img.url,
    position: img.position,
    caption: img.caption || "",
    type: "image" as const,
    width: "100%"
  }));
};

const CreatePageForm: React.FC<CreatePageFormProps> = ({
  parentPages, onPageCreated, keywordToIconMap
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<ImageUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [selectedIcon, setSelectedIcon] = useState<string>("FileText");
  const [selectedParentPath, setSelectedParentPath] = useState<string | undefined>(undefined);
  const { isCreating, isTranslating, handleTranslateAndCreate } = usePageCreation({ onPageCreated });

  const form = useForm<z.infer<typeof pageFormSchema>>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: "",
      content: "",
      icon: "FileText",
      pageType: "normal",
    },
  });

  const { watch } = form;
  const pageType = watch("pageType") as PageType;
  const isParentPage = pageType === "parent";

  const handleMainImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
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
      setIsUploading(false);
    }
  };

  const handleMainImageRemove = () => {
    setMainImage(null);
  };

  const onSubmit = async (values: z.infer<typeof pageFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (values.pageType === "submenu" && !selectedParentPath) {
        toast({
          title: "Errore",
          description: "Seleziona una pagina padre per il sottomenu",
          variant: "destructive",
        });
        return;
      }
      
      const convertedImages = convertToImageItem(pageImages);
      
      await handleTranslateAndCreate(
        { 
          title: values.title, 
          content: values.content || "", 
          icon: selectedIcon || "FileText",
          pageType: values.pageType,
          parentPath: selectedParentPath
        },
        mainImage,
        convertedImages,
        () => {
          form.reset();
          setMainImage(null);
          setPageImages([]);
          setSelectedIcon("FileText");
          setSelectedParentPath(undefined);
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
    form.reset();
    setMainImage(null);
    setPageImages([]);
    setSelectedIcon("FileText");
    setSelectedParentPath(undefined);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
            <FormHeader control={form.control} />

            <PageTypeSection
              pageType={pageType}
              setPageType={(type) => form.setValue("pageType", type)}
              parentPath={selectedParentPath || ""}
              setParentPath={setSelectedParentPath}
              icon={selectedIcon}
              setIcon={setSelectedIcon}
              parentPages={parentPages}
              control={form.control}
            />

            <SelectedIconDisplay iconName={selectedIcon} />
          </div>

          {!isParentPage && (
            <FormContentSection
              control={form.control}
              mainImage={mainImage}
              pageImages={pageImages}
              isUploading={isUploading}
              onMainImageUpload={handleMainImageUpload}
              onMainImageRemove={handleMainImageRemove}
              setPageImages={setPageImages}
            />
          )}

          <FormActions
            isSubmitting={isSubmitting}
            isCreating={isCreating}
            isTranslating={isTranslating}
            onCancel={handleCancel}
          />
        </form>
      </Form>
    </div>
  );
};

export default CreatePageForm;
