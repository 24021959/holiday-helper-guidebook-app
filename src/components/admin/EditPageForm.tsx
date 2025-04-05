
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { PageContentSection } from "./form/PageContentSection";
import { PageTypeSection } from "./form/PageTypeSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageIconSection } from "./form/PageIconSection";
import { PageMultiImageSection, ImageItem } from "./form/PageMultiImageSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditPageFormProps {
  page: PageData;
  parentPages: PageData[];
  onPageUpdated: (updatedPage: PageData) => void;
  keywordToIconMap: Record<string, string>;
  isSystemPage?: boolean;
}

export const EditPageForm: React.FC<EditPageFormProps> = ({
  page,
  parentPages,
  onPageUpdated,
  keywordToIconMap,
  isSystemPage = false
}) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState("");
  const [rawContent, setRawContent] = useState(page.content);
  const [path, setPath] = useState(page.path);
  const [isSubmenu, setIsSubmenu] = useState(page.isSubmenu || false);
  const [parentPath, setParentPath] = useState(page.parentPath || "");
  const [imageUrl, setImageUrl] = useState(page.imageUrl || "");
  const [icon, setIcon] = useState(page.icon || "FileText");
  const [isLoading, setIsLoading] = useState(false);
  const [listItems, setListItems] = useState(page.listItems || []);
  const [listType, setListType] = useState(page.listType || "");
  const [pageImages, setPageImages] = useState<ImageItem[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("content");

  // Estrai le immagini e il contenuto quando il componente viene montato
  useEffect(() => {
    if (rawContent) {
      let processedContent = rawContent;
      const extractedImages: ImageItem[] = [];

      if (rawContent.includes("<!-- IMAGES -->")) {
        const parts = rawContent.split("<!-- IMAGES -->");
        processedContent = parts[0]; // Contenuto testuale
        
        if (parts[1]) {
          const imageLines = parts[1].split("\n").filter(line => line.trim());
          
          for (const line of imageLines) {
            try {
              if (line.includes('"type":"image"')) {
                const imageData = JSON.parse(line);
                if (imageData.type === "image") {
                  extractedImages.push(imageData as ImageItem);
                }
              }
            } catch (e) {
              console.error("Errore nel parsing dell'immagine:", e);
            }
          }
        }
      }

      setContent(processedContent);
      setPageImages(extractedImages);
    }
  }, [rawContent]);

  // Funzione per convertire le immagini nel formato per il database
  const formatPageContent = (content: string, images: ImageItem[]) => {
    if (images.length === 0) return content;
    
    let enhancedContent = content;
    enhancedContent += "\n\n<!-- IMAGES -->\n";
    
    images.forEach((image, index) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (!title.trim()) {
        toast.error("Il titolo è obbligatorio");
        return;
      }
      
      if (!content.trim()) {
        toast.error("Il contenuto è obbligatorio");
        return;
      }
      
      if (!path.trim()) {
        toast.error("Il percorso è obbligatorio");
        return;
      }
      
      if (isSubmenu && !parentPath) {
        toast.error("Seleziona una pagina genitore");
        return;
      }
      
      // Formatta il contenuto con le immagini
      const formattedContent = formatPageContent(content, pageImages);
      
      const updateData = {
        title,
        content: formattedContent,
        path,
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null,
        image_url: imageUrl,
        icon,
        list_items: listItems,
        list_type: listType || null,
        page_images: pageImages.length > 0 ? pageImages : null
      };
      
      const { data, error } = await supabase
        .from('custom_pages')
        .update(updateData)
        .eq('id', page.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      await supabase
        .from('menu_icons')
        .update({
          label: title,
          icon,
          path,
          is_submenu: isSubmenu,
          parent_path: isSubmenu ? parentPath : null
        })
        .eq('path', page.path);
      
      const updatedPage: PageData = {
        id: data.id,
        title: data.title,
        content: data.content,
        path: data.path,
        imageUrl: data.image_url,
        icon: data.icon,
        isSubmenu: data.is_submenu,
        parentPath: data.parent_path,
        listItems: Array.isArray(data.list_items) ? data.list_items : [],
        listType: data.list_type as 'restaurants' | 'activities' | 'locations' | undefined,
        pageImages: Array.isArray(data.page_images) ? data.page_images.map(img => ({...img, type: "image"})) : []
      };
      
      onPageUpdated(updatedPage);
      
      toast.success("Pagina aggiornata con successo");
    } catch (error) {
      console.error("Errore nell'aggiornamento della pagina:", error);
      toast.error("Errore nell'aggiornamento della pagina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titolo</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Titolo della pagina"
        />
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content">Contenuto</TabsTrigger>
          <TabsTrigger value="images">Galleria Immagini</TabsTrigger>
          <TabsTrigger value="thumbnail">Immagine Principale</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <PageContentSection content={content} setContent={setContent} />
        </TabsContent>
        
        <TabsContent value="images">
          <PageMultiImageSection 
            images={pageImages}
            onImagesChange={setPageImages}
          />
        </TabsContent>
        
        <TabsContent value="thumbnail">
          <PageImageSection 
            imageUrl={imageUrl}
            onImageUploaded={handleImageUploaded}
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
      
      <PageIconSection 
        icon={icon}
        setIcon={setIcon}
      />
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Aggiornamento in corso..." : "Aggiorna pagina"}
      </Button>
    </form>
  );
};
