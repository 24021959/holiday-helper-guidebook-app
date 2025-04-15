import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import { v4 as uuidv4 } from "uuid";
import { ImageItem } from "@/types/image.types";

interface UsePageCreationProps {
  onPageCreated: (pages: any[]) => void;
}

interface SavePageData {
  title: string;
  content: string;
  path: string;
  imageUrl: string | null;
  icon: string;
  pageType: "normal" | "submenu" | "parent";
  parentPath: string | null;
}

export const usePageCreation = ({ onPageCreated }: UsePageCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { translateSequential } = useTranslation();

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

  const saveNewPage = async (pageData: SavePageData) => {
    try {
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', pageData.path)
        .maybeSingle();

      if (existingPage) {
        const { error: updateError } = await supabase
          .from('custom_pages')
          .update({
            title: pageData.title,
            content: pageData.content,
            image_url: pageData.imageUrl,
            icon: pageData.icon,
            is_submenu: pageData.pageType === "submenu",
            parent_path: pageData.pageType === "submenu" ? pageData.parentPath : null
          })
          .eq('id', existingPage.id);
          
        if (updateError) throw updateError;
      } else {
        const { error } = await supabase
          .from('custom_pages')
          .insert({
            title: pageData.title,
            content: pageData.content,
            path: pageData.path,
            image_url: pageData.imageUrl,
            icon: pageData.icon,
            is_submenu: pageData.pageType === "submenu",
            parent_path: pageData.pageType === "submenu" ? pageData.parentPath : null,
            published: true
          });

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

        if (iconError) throw iconError;
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

        if (iconError) throw iconError;
      }
    } catch (error) {
      console.error("Errore nel salvataggio della pagina:", error);
      throw error;
    }
  };

  const handleTranslateAndCreate = async (
    values: { title: string; content: string; icon: string },
    pageType: "normal" | "submenu" | "parent",
    parentPath: string,
    uploadedImage: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      setIsCreating(true);
      setIsTranslating(true);
      
      const pageId = uuidv4();
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const finalPath = pageType === "submenu" 
        ? `${parentPath}/${sanitizedTitle}` 
        : `/${sanitizedTitle}`;
      
      const formattedContent = pageType === "parent" 
        ? ""
        : formatPageContent(values.content, pageImages);

      toast.info("Avvio traduzione automatica in tutte le lingue...");

      const targetLangs: ("it" | "en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      await saveNewPage({
        title: values.title,
        content: formattedContent,
        path: finalPath,
        imageUrl: pageType === "parent" ? null : uploadedImage,
        icon: values.icon,
        pageType,
        parentPath: pageType === "submenu" ? parentPath : null,
      });

      const translations = await translateSequential(
        values.content,
        values.title,
        targetLangs
      );
      
      for (const lang of targetLangs) {
        if (translations[lang]) {
          const translatedPath = `/${lang}${finalPath}`;
          await saveNewPage({
            title: translations[lang].title,
            content: translations[lang].content,
            path: translatedPath,
            imageUrl: uploadedImage,
            icon: values.icon,
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
      
      if (fetchError) throw fetchError;
      
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
        toast.success("Pagina creata con successo");
        toast.info("Traduzioni completate. Vai alla pagina menu per vedere tutte le pagine");
        onSuccess();
      }
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    } finally {
      setIsCreating(false);
      setIsTranslating(false);
    }
  };

  return {
    isCreating,
    isTranslating,
    handleTranslateAndCreate
  };
};
