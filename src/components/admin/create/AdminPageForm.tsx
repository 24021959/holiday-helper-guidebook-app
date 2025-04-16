
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PageData } from "@/types/page.types";
import { ImageItem } from "@/types/image.types";
import { pageFormSchema } from '../schemas/pageFormSchema';
import { FormHeader } from '../form/FormHeader';
import { PageTypeSection } from '../form/PageTypeSection';
import { SelectedIconDisplay } from '../form/SelectedIconDisplay';
import { FormActions } from '../form/FormActions';
import { AdminPageContent } from "./AdminPageContent";
import { Globe } from "lucide-react";
import { toast } from "sonner";

interface PageContent {
  title: string;
  content: string;
  pageType: string;
  parentPath?: string;
  icon: string;
  images: ImageItem[];
}

interface AdminPageFormProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
  parentPages: PageData[];
  onManualTranslate?: (
    content: string,
    title: string,
    path: string,
    imageUrl: string | null,
    icon: string,
    pageType: string,
    parentPath: string | null,
    pageImages: ImageItem[]
  ) => Promise<void>;
}

export const AdminPageForm: React.FC<AdminPageFormProps> = ({
  pageToEdit,
  onEditComplete,
  parentPages,
  onManualTranslate
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(pageToEdit?.icon || "FileText");
  const [pageIsSaved, setPageIsSaved] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: pageToEdit?.title || "",
      content: pageToEdit?.content || "",
      pageType: (pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal"),
      parentPath: pageToEdit?.parentPath || "",
      icon: pageToEdit?.icon || "FileText"
    }
  });

  const [pageContent, setPageContent] = useState<PageContent>({
    title: pageToEdit?.title || "",
    content: pageToEdit?.content || "",
    pageType: (pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal"),
    parentPath: pageToEdit?.parentPath || "",
    icon: pageToEdit?.icon || "FileText",
    images: pageToEdit?.pageImages || []
  });
  
  const [savedPageData, setSavedPageData] = useState<{
    content: string;
    title: string;
    path: string;
    imageUrl: string | null;
    icon: string;
    pageType: string;
    parentPath: string | null;
    pageImages: ImageItem[];
  } | null>(null);

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
      
      // Save the page implementation would go here
      // This is a placeholder for the actual implementation
      toast.success(pageToEdit ? "Pagina aggiornata con successo" : "Pagina creata con successo");
      
      // Store the saved page data for possible translation
      setSavedPageData({
        content: pageContent.content,
        title: values.title,
        path: finalPath,
        imageUrl: null, // Replace with actual image URL
        icon: selectedIcon,
        pageType: values.pageType,
        parentPath: values.pageType === "submenu" ? values.parentPath : null,
        pageImages: pageContent.images
      });
      
      setPageIsSaved(true);
      
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast.error("Si è verificato un errore durante il salvataggio");
    }
  };

  const handleManualTranslation = async () => {
    if (!savedPageData) {
      toast.error("Nessun dato salvato disponibile per la traduzione");
      return;
    }
    
    setIsTranslating(true);
    
    try {
      if (onManualTranslate) {
        await onManualTranslate(
          savedPageData.content,
          savedPageData.title,
          savedPageData.path,
          savedPageData.imageUrl,
          savedPageData.icon,
          savedPageData.pageType,
          savedPageData.parentPath,
          savedPageData.pageImages
        );
        toast.success("Traduzione completata con successo");
      }
    } catch (error) {
      console.error("Errore durante la traduzione:", error);
      toast.error("Si è verificato un errore durante la traduzione");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0" data-no-translation="true">
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
          <form onSubmit={form.handleSubmit(handleSavePage)} className="space-y-6" data-no-translation="true">
            <div className="space-y-6">
              <FormHeader control={form.control} />

              <PageTypeSection
                pageType={pageContent.pageType}
                setPageType={(type) => {
                  setPageContent(prev => ({
                    ...prev,
                    pageType: type,
                    parentPath: type === "normal" ? undefined : prev.parentPath
                  }));
                  form.setValue("pageType", type);
                }}
                parentPath={pageContent.parentPath || ""}
                setParentPath={(path) => {
                  setPageContent(prev => ({
                    ...prev,
                    parentPath: path
                  }));
                  form.setValue("parentPath", path);
                }}
                icon={selectedIcon}
                setIcon={(icon) => {
                  setSelectedIcon(icon);
                  setPageContent(prev => ({
                    ...prev,
                    icon
                  }));
                  form.setValue("icon", icon);
                }}
                parentPages={parentPages}
                control={form.control}
              />

              <SelectedIconDisplay iconName={selectedIcon} />

              <AdminPageContent
                pageContent={pageContent}
                pageType={form.watch("pageType")}
                setPageContent={setPageContent}
                form={form}
              />

              <div className="flex flex-col gap-4">
                <FormActions
                  isSubmitting={false}
                  isCreating={false}
                  isTranslating={false}
                  onCancel={onEditComplete}
                  submitText="Salva Pagina"
                />
                
                {pageIsSaved && (
                  <div className="flex justify-center mt-4">
                    <Button
                      type="button"
                      onClick={handleManualTranslation}
                      disabled={isTranslating}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Globe className="w-5 h-5" />
                      {isTranslating ? "Traduzione in corso..." : "Traduci la pagina in tutte le lingue"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
