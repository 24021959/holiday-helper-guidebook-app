
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { ImageItem, ImageUploadItem } from "@/types/image.types";
import { PageType } from "@/types/form.types";
import { pageFormSchema } from '../schemas/pageFormSchema';
import { FormHeader } from './FormHeader';
import { PageTypeSection } from './PageTypeSection';
import { SelectedIconDisplay } from './SelectedIconDisplay';
import { FormContentSection } from './FormContentSection';
import { FormActions } from './FormActions';
import { PageData } from "@/types/page.types";
import type { z } from "zod";

interface PageFormProps {
  initialValues?: {
    title: string;
    content: string;
    icon: string;
    pageType: PageType;
    parentPath?: string;
  };
  parentPages: PageData[];
  isCreating: boolean;
  isTranslating: boolean;
  isSubmitting: boolean;
  mainImage: string | null;
  onMainImageUpload: (file: File) => Promise<void>;
  onMainImageRemove: () => void;
  onCancel: () => void;
  onSubmit: (values: z.infer<typeof pageFormSchema>, pageImages: ImageItem[]) => Promise<void>;
  submitButtonText?: string;
}

export const PageForm: React.FC<PageFormProps> = ({
  initialValues = { 
    title: "", 
    content: "", 
    icon: "FileText", 
    pageType: "normal",
    parentPath: ""
  },
  parentPages,
  isCreating,
  isTranslating,
  isSubmitting,
  mainImage,
  onMainImageUpload,
  onMainImageRemove,
  onCancel,
  onSubmit,
  submitButtonText
}) => {
  const [pageImages, setPageImages] = useState<ImageUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>(initialValues.icon);
  const [selectedParentPath, setSelectedParentPath] = useState<string | undefined>(initialValues.parentPath);

  // Initialize the form with useForm
  const form = useForm<z.infer<typeof pageFormSchema>>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialValues.title,
      content: initialValues.content,
      icon: initialValues.icon,
      pageType: initialValues.pageType,
      parentPath: initialValues.parentPath,
    },
  });

  const { watch } = form;
  const pageType = watch("pageType") as PageType;
  const isParentPage = pageType === "parent";

  const handleFormSubmit = async (values: z.infer<typeof pageFormSchema>) => {
    try {
      if (values.pageType === "submenu" && !selectedParentPath) {
        toast({
          title: "Errore",
          description: "Seleziona una pagina padre per il sottomenu",
          variant: "destructive",
        });
        return;
      }
      
      const formValues = {
        ...values,
        icon: selectedIcon,
        parentPath: selectedParentPath
      };
      
      const convertedImages = pageImages.map(img => ({
        url: img.url,
        position: img.position,
        caption: img.caption || "",
        type: "image" as const,
        width: "100%" as const
      }));
      
      await onSubmit(formValues, convertedImages);
      
    } catch (error) {
      console.error("Errore durante la sottomissione del form:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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
            onMainImageUpload={onMainImageUpload}
            onMainImageRemove={onMainImageRemove}
            setPageImages={setPageImages}
          />
        )}

        <FormActions
          isSubmitting={isSubmitting}
          isCreating={isCreating}
          isTranslating={isTranslating}
          onCancel={onCancel}
          submitText={submitButtonText}
        />
      </form>
    </Form>
  );
};
