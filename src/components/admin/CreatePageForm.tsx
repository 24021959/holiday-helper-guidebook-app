
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
import { PageContentSection } from "./form/PageContentSection";

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

      // Primo tentativo di inserimento dell'icona menu
      const { data: insertedIcon, error: iconError } = await supabase
        .from('menu_icons')
        .insert(iconData)
        .select('*')
        .single();
      
      if (iconError) {
        console.error("Errore nell'inserimento dell'icona:", iconError);
        
        // Secondo tentativo dopo un breve ritardo
        setTimeout(async () => {
          try {
            const { error: retryError } = await supabase
              .from('menu_icons')
              .insert(iconData);
              
            if (retryError) {
              console.error("Anche il secondo tentativo di inserimento dell'icona è fallito:", retryError);
              // Terzo tentativo con maggiore ritardo
              setTimeout(async () => {
                try {
                  const { error: lastRetryError } = await supabase
                    .from('menu_icons')
                    .insert(iconData);
                  
                  if (lastRetryError) {
                    console.error("Tutti i tentativi di inserimento dell'icona sono falliti:", lastRetryError);
                  } else {
                    console.log("Icona inserita con successo al terzo tentativo");
                  }
                } catch (e) {
                  console.error("Errore nel terzo tentativo di inserimento dell'icona:", e);
                }
              }, 2000);
            } else {
              console.log("Icona inserita con successo al secondo tentativo");
            }
          } catch (e) {
            console.error("Errore nel secondo tentativo di inserimento dell'icona:", e);
          }
        }, 1000);
      } else {
        console.log("Icona inserita con successo:", insertedIcon);
      }
      
      // Sincronizzazione forzata menu
      await syncMenuWithPages();
      
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

  // Funzione ausiliaria per sincronizzare tutte le pagine con il menu
  const syncMenuWithPages = async () => {
    try {
      console.log("Sincronizzazione di tutte le pagine con il menu...");
      
      // Recupera tutte le pagine
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('id, title, path, icon, parent_path, is_submenu')
        .eq('published', true);
        
      if (pagesError) {
        console.error("Errore nel recupero delle pagine:", pagesError);
        return;
      }
      
      if (!pages || pages.length === 0) {
        console.log("Nessuna pagina da sincronizzare");
        return;
      }
      
      // Recupera tutti i percorsi delle icone menu esistenti
      const { data: menuIcons, error: iconsError } = await supabase
        .from('menu_icons')
        .select('path');
        
      if (iconsError) {
        console.error("Errore nel recupero delle icone menu:", iconsError);
        return;
      }
      
      // Set dei percorsi esistenti
      const existingIconPaths = new Set(menuIcons?.map(icon => icon.path) || []);
      
      // Filtra solo le pagine senza icone menu
      const pagesWithoutIcons = pages.filter(page => !existingIconPaths.has(page.path));
      
      if (pagesWithoutIcons.length === 0) {
        console.log("Tutte le pagine hanno già un'icona nel menu");
        return;
      }
      
      console.log(`Trovate ${pagesWithoutIcons.length} pagine senza icone nel menu`);
      
      // Prepara i dati per le nuove icone
      const newIcons = pagesWithoutIcons.map(page => ({
        label: page.title,
        path: page.path,
        icon: page.icon || 'FileText',
        bg_color: "bg-blue-200",
        is_submenu: page.is_submenu,
        parent_path: page.parent_path,
        published: true
      }));
      
      // Inserisci le nuove icone
      const { error: insertError } = await supabase
        .from('menu_icons')
        .insert(newIcons);
        
      if (insertError) {
        console.error("Errore nell'inserimento delle nuove icone menu:", insertError);
        return;
      }
      
      console.log(`Sincronizzate ${newIcons.length} pagine con il menu`);
    } catch (error) {
      console.error("Errore nella sincronizzazione menu-pagine:", error);
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
          
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? "Creazione in corso..." : "Crea pagina"}
          </Button>
        </form>
      </Form>
    </>
  );
};
