import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageData } from "@/pages/Admin";
import { useTranslation } from "@/context/TranslationContext";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Languages, Globe } from "lucide-react";

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
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const { translatePage } = useTranslation();

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

  const handlePageTypeChange = (newType: "normal" | "submenu" | "parent") => {
    setPageType(newType);
    if (newType === "submenu") {
      form.setFocus("parentPath");
    } else {
      setParentPath("");
    }
  };

  const doTranslate = async () => {
    try {
      setIsTranslating(true);
      
      const targetLangs: ("it" | "en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      const values = form.getValues();
      toast.info("Avvio traduzione automatica in tutte le lingue...");

      const translations = await translateSequential(
        values.content,
        values.title,
        targetLangs
      );
      
      const sanitizedTitle = sanitizeTitle(values.title);
      const basePath = `/${sanitizedTitle}`;

      await saveNewPage({
        title: values.title,
        content: values.content,
        path: basePath,
        imageUrl: uploadedImage,
        icon: selectedIcon,
        pageType,
        parentPath,
      });
      
      for (const lang of targetLangs) {
        if (translations[lang]) {
          const translatedPath = `/${lang}${basePath}`;
          await saveNewPage({
            title: translations[lang].title,
            content: translations[lang].content,
            path: translatedPath,
            imageUrl: uploadedImage,
            icon: selectedIcon,
            pageType,
            parentPath: pageType === "submenu" ? 
              (parentPath.startsWith(`/${lang}`) ? parentPath : `/${lang}${parentPath}`) : 
              null,
          });
          
          toast.success(`Pagina tradotta in ${lang.toUpperCase()} e salvata con successo`);
        }
      }
      
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
          published: page.published || false,
          is_parent: false
        }));
        
        onPageCreated(formattedPages);
        
        console.log("Lista pagine aggiornata:", formattedPages);
        toast.success("Pagina creata con successo");
        
        if (autoTranslate) {
          toast.info("Traduzioni completate. Vai alla pagina menu per vedere tutte le pagine");
        } else {
          toast.info("Vai alla pagina menu per vedere le nuove pagine");
        }
      }
      
      form.reset();
      setUploadedImage(null);
      setPageType("normal");
      setParentPath("");
      setLocationItems([]);
      setListType(undefined);
      setSelectedIcon("FileText");
      setPageImages([]);
      setAutoTranslate(false);
      
    } catch (error) {
      console.error("Errore nella traduzione/salvataggio delle pagine:", error);
      toast.error("Errore nella creazione della pagina con traduzioni");
    } finally {
      setIsTranslating(false);
    }
  };

  const saveNewPage = async (pageData: {
    title: string;
    content: string;
    path: string;
    imageUrl: string | null;
    icon: string;
    pageType: "normal" | "submenu" | "parent";
    parentPath: string | null;
  }) => {
    try {
      const formattedContent = formatPageContent(pageData.content, pageImages);
      
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', pageData.path)
        .maybeSingle();

      if (existingPage) {
        console.log(`La pagina ${pageData.path} esiste già, aggiornando...`);
        const { error: updateError } = await supabase
          .from('custom_pages')
          .update({
            title: pageData.title,
            content: formattedContent,
            image_url: pageData.imageUrl,
            icon: pageData.icon,
            is_submenu: pageData.pageType === "submenu",
            parent_path: pageData.pageType === "submenu" ? pageData.parentPath : null
          })
          .eq('id', existingPage.id);
          
        if (updateError) throw updateError;
      } else {
        const { data, error } = await supabase
          .from('custom_pages')
          .insert({
            title: pageData.title,
            content: formattedContent,
            path: pageData.path,
            image_url: pageData.imageUrl,
            icon: pageData.icon,
            is_submenu: pageData.pageType === "submenu",
            parent_path: pageData.pageType === "submenu" ? pageData.parentPath : null,
            published: true
          })
          .select()
          .maybeSingle();

        if (error) throw error;
      }

      const { data: existingIcon } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('path', pageData.path)
        .maybeSingle();

      if (existingIcon) {
        const { error: iconError } = await supabase
          .from('menu_icons')
          .update({
            label: pageData.title,
            icon: pageData.icon,
            is_submenu: pageData.pageType === "submenu",
            parent_path: pageData.pageType === "submenu" ? pageData.parentPath : null,
            published: true
          })
          .eq('path', pageData.path);

        if (iconError) {
          console.error("Errore nell'aggiornamento dell'icona:", iconError);
        }
      } else {
        const { error: iconError } = await supabase
          .from('menu_icons')
          .insert({
            path: pageData.path,
            label: pageData.title,
            icon: pageData.icon,
            bg_color: 'bg-blue-200',
            is_submenu: pageData.pageType === "submenu",
            parent_path: pageData.pageType === "submenu" ? pageData.parentPath : null,
            published: true
          });

        if (iconError) {
          console.error("Errore nella creazione dell'icona:", iconError);
        }
      }
    } catch (error) {
      console.error("Errore nel salvataggio della pagina:", error);
      throw error;
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
      
      const formattedContent = pageType === "parent" 
        ? ""
        : formatPageContent(values.content, pageImages);
      
      const pageData = {
        id: pageId,
        title: values.title,
        content: formattedContent,
        path: finalPath,
        image_url: pageType === "parent" ? null : uploadedImage,
        icon: values.icon || selectedIcon,
        is_submenu: pageType === "submenu",
        parent_path: pageType === "submenu" ? parentPath : null,
        list_type: listType,
        list_items: listType && locationItems.length > 0 ? locationItems : null,
        published: true
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
      
      if (pageType === "normal" || pageType === "parent") {
        const menuIconData = {
          id: uuidv4(),
          path: finalPath,
          label: values.title,
          icon: values.icon || selectedIcon,
          bg_color: "bg-blue-200",
          published: true
        };
        
        const { error: menuIconError } = await supabase
          .from('menu_icons')
          .insert(menuIconData);
        
        if (menuIconError) {
          console.error("Errore nell'inserimento dell'icona del menu:", menuIconError);
        } else {
          console.log("Icona del menu inserita con successo");
        }
      }
      
      if (autoTranslate) {
        doTranslate();
      } else {
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
            published: page.published || false,
            is_parent: false
          }));
        
          onPageCreated(formattedPages);
        
          console.log("Lista pagine aggiornata:", formattedPages);
          toast.success("Pagina creata con successo");
        }
      }
      
      form.reset();
      setUploadedImage(null);
      setPageType("normal");
      setParentPath("");
      setLocationItems([]);
      setListType(undefined);
      setSelectedIcon("FileText");
      setPageImages([]);
      setAutoTranslate(false);
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    } finally {
      setIsCreating(false);
      setIsTranslating(false);
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
            setPageType={handlePageTypeChange}
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
          
          {!isContentTabDisabled && (
            <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-md border border-blue-100">
              <Switch
                id="auto-translate"
                checked={autoTranslate}
                onCheckedChange={setAutoTranslate}
              />
              <Label htmlFor="auto-translate" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium">Crea automaticamente versioni tradotte (EN, FR, ES, DE)</span>
              </Label>
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
