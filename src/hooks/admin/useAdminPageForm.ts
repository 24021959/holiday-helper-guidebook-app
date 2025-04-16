
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageData } from "@/types/page.types";
import { z } from "zod";
import { pageFormSchema } from '@/components/admin/schemas/pageFormSchema';
import { PageContent } from "@/pages/admin/AdminCreate";
import { usePageCreation } from "@/hooks/usePageCreation";

interface UseAdminPageFormProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

export const useAdminPageForm = ({ pageToEdit, onEditComplete }: UseAdminPageFormProps) => {
  const [pageContent, setPageContent] = useState<PageContent>(() => ({
    title: pageToEdit?.title || "",
    content: pageToEdit?.content || "",
    images: pageToEdit?.pageImages.map(img => ({
      url: img.url,
      position: img.position,
      caption: img.caption || "",
      type: "image" as const,
      width: "100%"
    })) || [],
    pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
    parentPath: pageToEdit?.parentPath
  }));

  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
  const { handleTranslateAndCreate, isCreating, isTranslating } = usePageCreation({
    onPageCreated: (pages) => {
      setPageContent({
        title: "",
        content: "",
        images: [],
        pageType: "normal"
      });
      setUploadedImage(null);
      onEditComplete();
      toast.success(pageToEdit ? "Pagina aggiornata con successo!" : "Pagina creata con successo!");
    }
  });

  const form = useForm<z.infer<typeof pageFormSchema>>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: pageToEdit?.title || "",
      content: pageToEdit?.content || "",
      icon: pageToEdit?.icon || "FileText",
      pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
      parentPath: pageToEdit?.parentPath || "",
    },
  });

  const handleSavePage = async (values: z.infer<typeof pageFormSchema>) => {
    try {
      const pageImages = pageContent.images.map(img => ({
        ...img,
        type: "image" as const,
        width: img.width || "100%"
      }));

      await handleTranslateAndCreate(
        {
          title: values.title,
          content: values.content || "",
          icon: values.icon || "FileText",
          pageType: values.pageType,
          parentPath: values.parentPath
        },
        uploadedImage,
        pageImages,
        () => {
          toast.success(pageToEdit ? "Pagina aggiornata con successo!" : "Pagina creata con successo!");
        }
      );
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Errore nel salvare la pagina");
    }
  };

  const handleCancel = () => {
    if (pageToEdit) {
      onEditComplete();
    }
    setPageContent({
      title: "",
      content: "",
      images: [],
      pageType: "normal"
    });
    setUploadedImage(null);
    form.reset();
  };

  return {
    form,
    pageContent,
    uploadedImage,
    isCreating,
    isTranslating,
    handleSavePage,
    handleCancel,
    setPageContent,
  };
};
