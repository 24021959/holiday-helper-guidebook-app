
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTranslationsStatus } from './PageTranslationsStatus';
import { PageIconSection } from './PageIconSection';
import { PageImageSection } from './PageImageSection';
import { PageContentSection } from './PageContentSection';
import { PageMultiImageSection } from './PageMultiImageSection';
import { PageTypeSection } from './PageTypeSection';
import { FormHeader } from './FormHeader';
import { ImageItem } from "@/types/image.types";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { formSchema, pageFormSchema } from '../schemas/pageFormSchema';
import { PageFormValues } from "@/types/form.types";

interface EditFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (pages: PageData[]) => void;
  handleTranslateAndCreate: (values: PageFormValues, imageUrl: string | null, pageImages: ImageItem[], onSuccess: () => void) => Promise<void>;
}

export const EditForm = ({ 
  selectedPage,
  parentPages,
  onPageUpdated,
  handleTranslateAndCreate
}: EditFormProps) => {
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
  
  const initialPageType = selectedPage.is_parent ? "parent" : selectedPage.isSubmenu ? "submenu" : "normal";
  const [pageType, setPageType] = useState<"normal" | "submenu" | "parent">(initialPageType);
  const [parentPath, setParentPath] = useState<string>(selectedPage.parentPath || "");
  
  const currentLanguage = getLanguageFromPath(selectedPage.path);
  
  // Initialize the form with the selected page values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedPage.title,
      content: selectedPage.content,
      icon: selectedPage.icon || "FileText",
      pageType: initialPageType,
      parentPath: selectedPage.parentPath || "",
    },
  });

  useEffect(() => {
    // Ensure form is reset whenever selectedPage changes
    form.reset({
      title: selectedPage.title,
      content: selectedPage.content,
      icon: selectedPage.icon || "FileText",
      pageType: initialPageType,
      parentPath: selectedPage.parentPath || "",
    });
    
    setSelectedIcon(selectedPage.icon || "FileText");
    setUploadedImage(selectedPage.imageUrl || null);
    setPageImages(initialPageImages);
    setPageType(initialPageType);
    setParentPath(selectedPage.parentPath || "");
  }, [selectedPage]);

  const handleOnSubmit = async (formValues: z.infer<typeof formSchema>) => {
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

  // Handle page images change while maintaining the correct format
  const handlePageImagesChange = (newImages: ImageItem[]) => {
    setPageImages(newImages);
  };

  return (
    <FormProvider {...form}>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Modifica Pagina</h2>
      
      <PageTranslationsStatus 
        currentLanguage={currentLanguage}
        title={selectedPage.title}
        path={selectedPage.path}
        isTranslating={isTranslating}
        availableTranslations={availableTranslations}
        onTranslate={() => handleOnSubmit(form.getValues())}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
          <FormHeader control={form.control} />
          
          <PageTypeSection 
            pageType={pageType}
            setPageType={setPageType}
            parentPath={parentPath}
            setParentPath={setParentPath}
            icon={selectedIcon}
            setIcon={setSelectedIcon}
            parentPages={parentPages.filter(p => p.id !== selectedPage.id)}
            control={form.control}
          />
          
          <PageIconSection 
            icon={selectedIcon}
            setIcon={setSelectedIcon}
          />
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="content">Contenuto</TabsTrigger>
              <TabsTrigger value="images">Galleria Immagini</TabsTrigger>
              <TabsTrigger value="thumbnail">Immagine Principale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <PageContentSection 
                name="content" 
                label="Contenuto della pagina" 
                pageImages={pageImages}
                onInsertImage={handleImageInsertion}
              />
            </TabsContent>
            
            <TabsContent value="images">
              <PageMultiImageSection 
                images={pageImages}
                onImagesChange={handlePageImagesChange}
              />
            </TabsContent>
            
            <TabsContent value="thumbnail">
              <PageImageSection 
                imageUrl={uploadedImage}
                onImageUploaded={setUploadedImage}
              />
            </TabsContent>
          </Tabs>
          
          <div className="pt-4 border-t flex justify-end space-x-4">
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Salva modifiche
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};
