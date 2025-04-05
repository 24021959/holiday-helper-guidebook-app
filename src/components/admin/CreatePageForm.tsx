
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
import { PageContentSection } from "./form/PageContentSection";
import { PageTypeSection } from "./form/PageTypeSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageIconSection } from "./form/PageIconSection";
import { PageMultiImageSection, ImageItem } from "./form/PageMultiImageSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema validation
const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  path: z.string().min(1, "Il percorso è obbligatorio"),
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
  const [isSubmenu, setIsSubmenu] = useState(false);
  const [parentPath, setParentPath] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants" | undefined>();
  const [locationItems, setLocationItems] = useState<any[]>([]);
  const [selectedIcon, setSelectedIcon] = useState("FileText");
  const [pageImages, setPageImages] = useState<ImageItem[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("content");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [newPageData, setNewPageData] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      path: "",
      icon: "FileText",
    },
  });

  // Format page content to include image data
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
      const pageId = uuidv4();
      const finalPath = isSubmenu 
        ? `${parentPath}/${values.path}` 
        : `/${values.path}`;
      
      // Format the content including image data
      const formattedContent = formatPageContent(values.content, pageImages);
      
      // Prepare data for insertion to custom_pages table
      const pageData = {
        id: pageId,
        title: values.title,
        content: formattedContent,
        path: finalPath,
        image_url: uploadedImage,
        icon: values.icon || selectedIcon,
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null,
        list_type: listType,
        list_items: listType && locationItems.length > 0 ? locationItems : null,
        page_images: pageImages.length > 0 ? pageImages.map(img => ({...img, type: "image"})) : null,
        published: false // Default to not published
      };

      // Save the new page data to show in the publish dialog
      setNewPageData(pageData);
      setShowPublishDialog(true);
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    }
  };

  const savePageToDatabase = async (shouldPublish: boolean) => {
    try {
      if (!newPageData) return;
      
      // Update the published state based on user choice
      const pageDataToSave = {
        ...newPageData,
        published: shouldPublish
      };
      
      console.log("Page data for insertion:", pageDataToSave);

      // 1. Insert into custom_pages table
      const { data: insertedPage, error: pagesError } = await supabase
        .from('custom_pages')
        .insert(pageDataToSave)
        .select('*')
        .single();
      
      if (pagesError) {
        console.error("Error inserting page:", pagesError);
        throw pagesError;
      }
      
      console.log("Page inserted successfully:", insertedPage);
      
      // 2. Insert into menu_icons table
      const iconData = {
        label: pageDataToSave.title,
        path: pageDataToSave.path,
        icon: pageDataToSave.icon,
        bg_color: "bg-blue-200",
        is_submenu: pageDataToSave.is_submenu,
        parent_path: pageDataToSave.parent_path,
        published: shouldPublish // Set published state for menu icon
      };

      console.log("Icon data for insertion:", iconData);

      const { data: insertedIcon, error: iconError } = await supabase
        .from('menu_icons')
        .insert(iconData)
        .select('*')
        .single();
      
      if (iconError) {
        console.error("Error inserting icon:", iconError);
        throw iconError;
      }
      
      console.log("Icon inserted successfully:", insertedIcon);
      
      // Fetch all pages to update the list
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (fetchError) {
        console.error("Error fetching pages:", fetchError);
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
          pageImages: page.page_images ? (page.page_images as any[]).map(img => ({...img, type: "image"})) : [],
          published: page.published || false
        }));
        
        // Update pages list in parent component
        onPageCreated(formattedPages);
        
        console.log("Updated pages list:", formattedPages);
      }
      
      // Reset form and state
      form.reset();
      setUploadedImage(null);
      setIsSubmenu(false);
      setParentPath("");
      setLocationItems([]);
      setListType(undefined);
      setSelectedIcon("FileText");
      setPageImages([]);
      setShowPublishDialog(false);
      setNewPageData(null);
      
      toast.success(shouldPublish 
        ? "Pagina creata e pubblicata con successo" 
        : "Pagina salvata come bozza");
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
      setShowPublishDialog(false);
    }
  };

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
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percorso URL</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    {isSubmenu && (
                      <span className="text-gray-500">{parentPath}/</span>
                    )}
                    <Input placeholder="percorso-url" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                    <FormLabel>Contenuto</FormLabel>
                    <FormControl>
                      <PageContentSection 
                        content={field.value} 
                        setContent={(value) => field.onChange(value)} 
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
          
          <PageTypeSection 
            isSubmenu={isSubmenu}
            setIsSubmenu={setIsSubmenu}
            parentPath={parentPath}
            setParentPath={setParentPath}
            parentPages={parentPages}
          />
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icona</FormLabel>
                <FormControl>
                  <PageIconSection 
                    icon={selectedIcon}
                    setIcon={(icon) => {
                      setSelectedIcon(icon);
                      field.onChange(icon);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">Crea pagina</Button>
        </form>
      </Form>

      {/* Publish Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pubblicare la pagina?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi pubblicare questa pagina subito? Se pubblichi, la pagina sarà visibile nel menu. In caso contrario, sarà salvata come bozza e potrai pubblicarla successivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => savePageToDatabase(false)}>
              Salva come bozza
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => savePageToDatabase(true)}>
              Pubblica ora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
