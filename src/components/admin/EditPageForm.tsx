
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { PageData } from "@/pages/Admin";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageIconSection } from "./form/PageIconSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageContentSection } from "./form/PageContentSection";
import { PageMultiImageSection, ImageItem } from "./form/PageMultiImageSection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageTypeSection } from "./form/PageTypeSection";

interface EditPageFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (updatedPages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
}

const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  icon: z.string().optional(),
});

const EditPageForm: React.FC<EditPageFormProps> = ({ 
  selectedPage,
  parentPages,
  onPageUpdated,
  keywordToIconMap
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(selectedPage.icon || "FileText");
  const [uploadedImage, setUploadedImage] = useState<string | null>(selectedPage.imageUrl || null);
  const [pageImages, setPageImages] = useState<ImageItem[]>(selectedPage.pageImages || []);
  const [currentTab, setCurrentTab] = useState<string>("content");
  
  // Page type state
  const initialPageType = selectedPage.is_parent ? "parent" : selectedPage.isSubmenu ? "submenu" : "normal";
  const [pageType, setPageType] = useState<"normal" | "submenu" | "parent">(initialPageType);
  const [parentPath, setParentPath] = useState<string>(selectedPage.parentPath || "");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedPage.title,
      content: selectedPage.content,
      icon: selectedPage.icon || "FileText",
    },
  });

  const formatPageContent = (content: string, images: ImageItem[]) => {
    if (images.length === 0) return content;
    
    const contentImages = images
      .filter(img => img.insertInContent)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
      
    const galleryImages = images.filter(img => !img.insertInContent);
    
    if (contentImages.length === 0) {
      let enhancedContent = content;
      enhancedContent += "\n\n<!-- IMAGES -->\n";
      
      galleryImages.forEach((image) => {
        const imageMarkup = JSON.stringify({
          type: "image",
          url: image.url,
          position: image.position,
          caption: image.caption || ""
        });
        
        enhancedContent += `\n${imageMarkup}\n`;
      });
      
      return enhancedContent;
    } else {
      const paragraphs = content.split('\n').filter(p => p.trim() !== '');
      
      let newContent = '';
      let currentImageIndex = 0;
      let lastInsertedIndex = -1;
      
      paragraphs.forEach((paragraph, index) => {
        newContent += paragraph + '\n\n';
        
        while (
          currentImageIndex < contentImages.length && 
          (contentImages[currentImageIndex].order || 0) <= index && 
          (contentImages[currentImageIndex].order || 0) > lastInsertedIndex
        ) {
          const img = contentImages[currentImageIndex];
          const imgMarkdown = `<!-- IMAGE-CONTENT-${currentImageIndex} -->\n${JSON.stringify({
            type: "image",
            url: img.url,
            position: img.position,
            caption: img.caption || "",
            contentImage: true
          })}\n\n`;
          
          newContent += imgMarkdown;
          lastInsertedIndex = index;
          currentImageIndex++;
        }
      });
      
      if (currentImageIndex < contentImages.length) {
        while (currentImageIndex < contentImages.length) {
          const img = contentImages[currentImageIndex];
          const imgMarkdown = `<!-- IMAGE-CONTENT-${currentImageIndex} -->\n${JSON.stringify({
            type: "image",
            url: img.url,
            position: img.position,
            caption: img.caption || "",
            contentImage: true
          })}\n\n`;
          
          newContent += imgMarkdown;
          currentImageIndex++;
        }
      }
      
      if (galleryImages.length > 0) {
        newContent += "\n\n<!-- IMAGES -->\n";
        
        galleryImages.forEach((image) => {
          const imageMarkup = JSON.stringify({
            type: "image",
            url: image.url,
            position: image.position,
            caption: image.caption || ""
          });
          
          newContent += `\n${imageMarkup}\n`;
        });
      }
      
      return newContent;
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

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUpdating(true);
      
      const formattedContent = formatPageContent(values.content, pageImages);
      
      const isSubmenu = pageType === "submenu";
      const isParent = pageType === "parent";
      
      const updateData = {
        title: values.title,
        content: formattedContent,
        image_url: uploadedImage,
        icon: selectedIcon,
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null
      };
      
      const { error: pageError } = await supabase
        .from('custom_pages')
        .update(updateData)
        .eq('id', selectedPage.id);
      
      if (pageError) {
        throw pageError;
      }
      
      const iconData = {
        label: values.title,
        icon: selectedIcon,
        bg_color: "bg-blue-200",
        parent_path: isSubmenu ? parentPath : null,
        is_submenu: isSubmenu
      };
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .update(iconData)
        .eq('path', selectedPage.path);
      
      if (iconError) {
        console.error("Errore nell'aggiornamento dell'icona:", iconError);
      }
      
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (fetchError) {
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
          published: page.published,
          is_parent: false
        }));
        
        // Mark parent pages
        for (let i = 0; i < formattedPages.length; i++) {
          const page = formattedPages[i];
          const hasChildren = formattedPages.some(p => p.parentPath === page.path);
          
          if (hasChildren || page.id === selectedPage.id && isParent) {
            formattedPages[i] = { ...page, is_parent: true };
          }
        }
        
        onPageUpdated(formattedPages);
        toast.success("Pagina aggiornata con successo");
      }
      
    } catch (error) {
      console.error("Errore nell'aggiornamento della pagina:", error);
      toast.error("Errore nell'aggiornamento della pagina");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <FormProvider {...form}>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Modifica Pagina</h2>
      
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
          
          <PageTypeSection 
            pageType={pageType}
            setPageType={setPageType}
            parentPath={parentPath}
            setParentPath={setParentPath}
            parentPages={parentPages.filter(p => p.id !== selectedPage.id)}
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
          
          <div className="pt-4 border-t flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? "Aggiornamento..." : "Salva modifiche"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default EditPageForm;
