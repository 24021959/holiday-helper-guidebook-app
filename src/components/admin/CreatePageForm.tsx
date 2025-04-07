
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageData } from "@/pages/Admin";
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
import { Textarea } from "@/components/ui/textarea";
import { PageTypeSection } from "./form/PageTypeSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageIconSection } from "./form/PageIconSection";
import { PageMultiImageSection, ImageItem } from "./form/PageMultiImageSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema validation
const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio").or(z.literal('')),
  icon: z.string().optional(),
});

interface CreatePageFormProps {
  parentPages: PageData[];
  onPageCreated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
}

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
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      icon: "FileText",
    },
  });

  // When page type changes to parent, reset content-related state and disable content tab
  React.useEffect(() => {
    if (pageType === "parent") {
      form.setValue("content", "");
      setUploadedImage(null);
      setPageImages([]);
      setCurrentTab("content");
    }
  }, [pageType, form]);

  const formatPageContent = (content: string, images: ImageItem[]) => {
    if (images.length === 0) return content;
    
    let enhancedContent = content;
    enhancedContent += "\n\n<!-- IMAGES -->\n";
    
    images.forEach((image) => {
      const imageMarkup = JSON.stringify({
        type: "image",
        url: image.url,
        position: image.position,
        caption: image.caption || ""
      });
      
      enhancedContent += `\n${imageMarkup}\n`;
    });
    
    return enhancedContent;
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsCreating(true);
      
      const pageId = uuidv4();
      
      const pathValue = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')  // Remove special chars
        .replace(/\s+/g, '-');     // Replace spaces with hyphens
      
      const finalPath = pageType === "submenu" 
        ? `${parentPath}/${pathValue}` 
        : `/${pathValue}`;
      
      const formattedContent = pageType !== "parent" 
        ? formatPageContent(values.content, pageImages)
        : "";
      
      // Dati pagina
      const pageData = {
        id: pageId,
        title: values.title,
        content: formattedContent,
        path: finalPath,
        image_url: pageType !== "parent" ? uploadedImage : null,
        icon: values.icon || selectedIcon,
        is_submenu: pageType === "submenu",
        parent_path: pageType === "submenu" ? parentPath : null,
        list_type: listType,
        list_items: listType && locationItems.length > 0 ? locationItems : null,
        published: true // Sempre pubblicato automaticamente
      };
      
      console.log("Dati pagina per inserimento:", pageData);

      const { data: insertedPage, error: pagesError } = await supabase
        .from('custom_pages')
        .insert(pageData)
        .select('*')
        .single();
      
      if (pagesError) {
        console.error("Errore nell'inserimento della pagina:", pagesError);
        throw pagesError;
      }
      
      console.log("Pagina inserita con successo:", insertedPage);
      
      // IMPORTANTE: Creiamo l'icona del menu in modo separato 
      const iconData = {
        label: pageData.title,
        path: pageData.path,
        icon: pageData.icon,
        bg_color: "bg-blue-200",
        is_submenu: pageData.is_submenu,
        parent_path: pageData.parent_path,
        published: true // Sempre pubblicato automaticamente
      };

      console.log("Dati icona per inserimento:", iconData);

      const { data: insertedIcon, error: iconError } = await supabase
        .from('menu_icons')
        .insert(iconData)
        .select('*')
        .single();
      
      if (iconError) {
        console.error("Errore nell'inserimento dell'icona:", iconError);
        throw iconError;
      }
      
      console.log("Icona inserita con successo:", insertedIcon);
      
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (fetchError) {
        console.error("Errore nel recupero delle pagine:", fetchError);
        throw fetchError;
      }
      
      if (pagesData) {
        const formattedPages = pagesData.map(page => ({
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
          published: true // Sempre pubblicato
        }));
        
        onPageCreated(formattedPages);
        
        console.log("Lista pagine aggiornata:", formattedPages);
        toast.success("Pagina creata e aggiunta al menu con successo");
      }
      
      // Reset form
      form.reset();
      setUploadedImage(null);
      setPageType("normal");
      setParentPath("");
      setLocationItems([]);
      setListType(undefined);
      setSelectedIcon("FileText");
      setPageImages([]);
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    } finally {
      setIsCreating(false);
    }
  };

  // Function to check if content tab should be disabled
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
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenuto della pagina</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Inserisci qui il contenuto della pagina..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
          
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? "Creazione in corso..." : "Crea pagina"}
          </Button>
        </form>
      </Form>
    </>
  );
};
