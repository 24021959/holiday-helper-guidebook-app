
import React from "react";
import { useState, useEffect } from "react";
import { VisualEditor } from "@/components/admin/VisualEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePageCreation } from "@/hooks/usePageCreation";
import { ImageItem, ImageDetail } from "@/types/image.types";
import { PageData } from "@/types/page.types";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PageType } from "@/types/form.types";
import { FormHeader } from "@/components/admin/form/FormHeader";
import { PageTypeSection } from "@/components/admin/form/PageTypeSection";
import { SelectedIconDisplay } from "@/components/admin/form/SelectedIconDisplay";
import { FormActions } from "@/components/admin/form/FormActions";
import IconRenderer from "@/components/IconRenderer";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/components/admin/schemas/pageFormSchema";
import { Form } from "@/components/ui/form";

export interface PageContent {
  title: string;
  content: string;
  images: ImageItem[];
  pageType: PageType;
  parentPath?: string;
}

interface AdminCreateProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

const AdminCreate = ({ pageToEdit, onEditComplete }: AdminCreateProps) => {
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

  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
  const [selectedIcon, setSelectedIcon] = useState<string>(pageToEdit?.icon || "FileText");
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

  // Inizializziamo il form correttamente con useForm
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: pageToEdit?.title || "",
      content: pageToEdit?.content || "",
      icon: pageToEdit?.icon || "FileText",
      pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
      parentPath: pageToEdit?.parentPath || "",
    },
  });

  useEffect(() => {
    const fetchParentPages = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('is_submenu', false);
        
        if (error) throw error;
        
        if (data) {
          const formattedPages = data.map(page => ({
            id: page.id,
            title: page.title,
            content: page.content,
            path: page.path,
            imageUrl: page.image_url,
            icon: page.icon,
            listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
            listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
            isSubmenu: page.is_submenu || false,
            parentPath: page.parent_path || undefined,
            pageImages: [],
            published: page.published || false,
            is_parent: page.is_parent || false
          }));
          
          setParentPages(formattedPages);
          console.log("Fetched parent pages:", formattedPages);
        }
      } catch (error) {
        console.error("Error fetching parent pages:", error);
        toast.error("Errore nel caricamento delle pagine genitore");
      }
    };
    
    fetchParentPages();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageContent(prev => ({
      ...prev,
      title: e.target.value
    }));
    // Aggiorniamo anche il form
    form.setValue("title", e.target.value);
  };

  const handleContentChange = (newContent: string) => {
    setPageContent(prev => ({
      ...prev,
      content: newContent
    }));
    // Aggiorniamo anche il form
    form.setValue("content", newContent);
  };

  const handleImageAdd = (imageDetail: ImageDetail) => {
    const newImage: ImageItem = {
      ...imageDetail,
      type: "image",
      width: imageDetail.width || "100%"
    };
    
    setPageContent(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const handlePageTypeChange = (value: PageType) => {
    setPageContent(prev => ({
      ...prev,
      pageType: value,
      parentPath: value === "normal" ? undefined : prev.parentPath
    }));
    // Aggiorniamo anche il form
    form.setValue("pageType", value);
  };

  const handleParentPathChange = (value: string) => {
    setPageContent(prev => ({
      ...prev,
      parentPath: value
    }));
    // Aggiorniamo anche il form
    form.setValue("parentPath", value);
  };

  const handleSavePage = async () => {
    try {
      const pageImages = pageContent.images.map(img => ({
        ...img,
        type: "image" as const,
        width: img.width || "100%"
      }));

      await handleTranslateAndCreate(
        {
          title: form.getValues("title"),
          content: form.getValues("content"),
          icon: selectedIcon || "FileText",
          pageType: form.getValues("pageType") as PageType,
          parentPath: form.getValues("parentPath")
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

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {pageToEdit ? "Modifica pagina" : "Crea una nuova pagina"}
          </CardTitle>
          <CardDescription>
            {pageToEdit 
              ? "Modifica i contenuti della pagina esistente"
              : "Utilizza l'editor visuale per creare una nuova pagina"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSavePage)} className="space-y-6">
              <div className="space-y-6">
                <FormHeader control={form.control} />

                <PageTypeSection
                  pageType={pageContent.pageType}
                  setPageType={handlePageTypeChange}
                  parentPath={pageContent.parentPath || ""}
                  setParentPath={handleParentPathChange}
                  icon={selectedIcon}
                  setIcon={setSelectedIcon}
                  parentPages={parentPages}
                  control={form.control}
                />

                <SelectedIconDisplay iconName={selectedIcon} />

                {pageContent.pageType !== "parent" && (
                  <div className="border rounded-lg">
                    <VisualEditor 
                      content={pageContent.content}
                      images={pageContent.images}
                      onChange={handleContentChange}
                      onImageAdd={handleImageAdd}
                    />
                  </div>
                )}

                <FormActions
                  isSubmitting={isCreating || isTranslating}
                  isCreating={isCreating}
                  isTranslating={isTranslating}
                  onCancel={() => {
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
                  }}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreate;
