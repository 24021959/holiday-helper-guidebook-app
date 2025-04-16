
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadImage } from "@/integrations/supabase/storage";
import { toast } from "sonner";
import { PageData } from "@/types/page.types";
import { ImageItem } from "@/types/image.types";
import { PageFormValues, PageType } from "@/types/form.types";
import { pageFormSchema } from "@/components/admin/schemas/pageFormSchema";
import { usePageCreation } from "../usePageCreation";

interface UseAdminPageFormProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

export const useAdminPageForm = ({ pageToEdit, onEditComplete }: UseAdminPageFormProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
  const [pageImages, setPageImages] = useState<ImageItem[]>(pageToEdit?.pageImages || []);
  const [pageContent, setPageContent] = useState({
    title: pageToEdit?.title || "",
    content: pageToEdit?.content || "",
    pageType: (pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal") as PageType,
    parentPath: pageToEdit?.parentPath || "",
    icon: pageToEdit?.icon || "FileText"
  });

  const { handlePageCreation, isCreating, isTranslating, handleManualTranslation } = usePageCreation({
    onPageCreated: () => {
      // Refresh page list or handle success
    }
  });

  const form = useForm({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: pageToEdit?.title || "",
      content: pageToEdit?.content || "",
      pageType: (pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal") as PageType,
      parentPath: pageToEdit?.parentPath || "",
      icon: pageToEdit?.icon || "FileText"
    }
  });

  const handleSavePage = async (values: any) => {
    try {
      // Process and save the page
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;
      
      await handlePageCreation(
        {
          title: values.title,
          content: pageContent.content,
          icon: pageContent.icon,
          pageType: values.pageType,
          parentPath: values.parentPath
        },
        uploadedImage,
        pageImages,
        () => {
          toast.success(pageToEdit ? "Pagina aggiornata con successo" : "Pagina creata con successo");
          onEditComplete();
        }
      );
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast.error("Si è verificato un errore durante il salvataggio");
    }
  };

  // Add the missing function to fix the TypeScript error
  const handleTranslateAndCreate = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      // Process and save the page
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;
      
      await handlePageCreation(
        values,
        imageUrl,
        pageImages,
        onSuccess
      );
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast.error("Si è verificato un errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    onEditComplete();
  };

  return {
    form,
    pageContent,
    setPageContent,
    uploadedImage,
    setUploadedImage,
    pageImages,
    setPageImages,
    isCreating,
    isTranslating,
    handleSavePage,
    handleCancel,
    handleTranslateAndCreate
  };
};
