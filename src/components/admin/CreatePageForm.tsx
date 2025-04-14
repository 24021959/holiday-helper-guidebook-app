
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePageCreation } from "@/hooks/usePageCreation";
import { CreatePageFormProps } from "@/types/page.types";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTypeSection } from "./form/PageTypeSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageIconSection } from "./form/PageIconSection";
import { PageMultiImageSection, ImageItem } from "./form/PageMultiImageSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContentSection } from "./form/PageContentSection";

const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio").or(z.literal('')),
  icon: z.string().optional(),
});

export const CreatePageForm: React.FC<CreatePageFormProps> = ({ 
  parentPages, 
  onPageCreated,
  keywordToIconMap 
}) => {
  const [pageType, setPageType] = useState<"normal" | "submenu" | "parent">("normal");
  const [parentPath, setParentPath] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants" | undefined>();
  const [locationItems, setLocationItems] = useState<any[]>([]);
  const [selectedIcon, setSelectedIcon] = useState("FileText");
  const [pageImages, setPageImages] = useState<ImageItem[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("content");

  const { isCreating, isTranslating, handleTranslateAndCreate } = usePageCreation({
    onPageCreated,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      icon: "FileText",
    },
  });

  useEffect(() => {
    if (pageType === "parent") {
      form.setValue("content", "");
      setUploadedImage(null);
      setPageImages([]);
      setCurrentTab("content");
    }
  }, [pageType, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    handleTranslateAndCreate(
      values,
      pageType,
      parentPath,
      uploadedImage,
      pageImages,
      () => {
        form.reset();
        setUploadedImage(null);
        setPageType("normal");
        setParentPath("");
        setLocationItems([]);
        setListType(undefined);
        setSelectedIcon("FileText");
        setPageImages([]);
      }
    );
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

  const isContentTabDisabled = pageType === "parent";

  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Crea Nuova Pagina</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titolo</FormLabel>
                <FormControl>
                  <Input placeholder="Titolo della pagina" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <PageIconSection 
                  icon={selectedIcon}
                  setIcon={(icon) => {
                    setSelectedIcon(icon);
                    field.onChange(icon);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <PageTypeSection 
            pageType={pageType}
            setPageType={setPageType}
            parentPath={parentPath}
            setParentPath={setParentPath}
            parentPages={parentPages}
          />
          
          {!isContentTabDisabled && (
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
                  onImagesChange={setPageImages}
                />
              </TabsContent>
              
              <TabsContent value="thumbnail">
                <PageImageSection 
                  imageUrl={uploadedImage}
                  onImageUploaded={setUploadedImage}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {isContentTabDisabled && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <p className="text-amber-800 font-medium">
                Le pagine genitore non hanno contenuto proprio. Servono solo come contenitore per le sottopagine.
              </p>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isCreating || isTranslating}>
            {isCreating ? "Creazione in corso..." : isTranslating ? "Traduzione in corso..." : "Crea pagina"}
          </Button>
        </form>
      </Form>
    </>
  );
};
