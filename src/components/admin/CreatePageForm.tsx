
import React, { useState } from "react";
import { useRouter } from '@/lib/next-router-mock';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Editor } from "@/components/editor/Editor";
import { uploadImage } from "@/integrations/supabase/storage";
import ImagesUploader from "@/components/ImagesUploader";
import { ImageItem, ImageUploadItem } from "@/types/image.types";
import { useToast } from "@/hooks/use-toast";
import { PageData } from "@/types/page.types";
import { PageType } from "@/types/form.types";
import { PageTypeSection } from "@/components/admin/form/PageTypeSection";
import { usePageCreation } from "@/hooks/usePageCreation";
import IconRenderer from "@/components/IconRenderer";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

const pageFormSchema = z.object({
  title: z.string().min(2, {
    message: "Il titolo deve essere di almeno 2 caratteri.",
  }),
  content: z.string().optional(),
  icon: z.string().optional(),
  pageType: z.enum(["normal", "submenu", "parent"]).default("normal"),
  parentPath: z.string().optional(),
});

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
  const router = useRouter();
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

  const { watch, setValue } = form;
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

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
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

            <PageTypeSection
              pageType={pageType}
              setPageType={(type) => setValue("pageType", type)}
              parentPath={selectedParentPath || ""}
              setParentPath={setSelectedParentPath}
              icon={selectedIcon}
              setIcon={setSelectedIcon}
              parentPages={parentPages}
              control={form.control}
            />

            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="mb-2">
                  <strong>Icona selezionata:</strong>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                  <IconRenderer iconName={selectedIcon} size="medium" />
                  <span className="text-sm">{selectedIcon}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {!isParentPage && (
            <>
              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FormLabel>Immagine Principale</FormLabel>
                  <FormDescription>
                    Carica un'immagine da visualizzare in cima alla pagina.
                  </FormDescription>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleMainImageUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        type="button"
                        asChild
                      >
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {isUploading ? "Caricando..." : "Carica Immagine"}
                        </label>
                      </Button>
                      {mainImage && (
                        <div className="relative">
                          <img
                            src={mainImage}
                            alt="Anteprima"
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="absolute top-0 right-0"
                            onClick={handleMainImageRemove}
                          >
                            <span className="sr-only">Rimuovi</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </div>

                <div>
                  <FormLabel>Immagini nella pagina</FormLabel>
                  <FormDescription>
                    Aggiungi immagini da mostrare all'interno della pagina.
                  </FormDescription>
                  <FormControl>
                    <ImagesUploader 
                      images={pageImages} 
                      onChange={setPageImages} 
                    />
                  </FormControl>
                </div>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenuto</FormLabel>
                    <FormDescription>
                      Scrivi il contenuto della pagina. Puoi usare Markdown per formattare
                      il testo.
                    </FormDescription>
                    <FormControl>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={100}>
                          <Editor
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" disabled={isSubmitting || isCreating || isTranslating}>
            {isSubmitting ? "Creazione in corso..." : (isCreating || isTranslating) ? "Traduzione in corso..." : "Crea Pagina"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreatePageForm;
