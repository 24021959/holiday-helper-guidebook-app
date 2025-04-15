import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import { v4 as uuidv4 } from "uuid";
import { ImageItem } from "@/types/image.types";
import { PageFormValues } from "@/types/form.types";

interface UsePageCreationProps {
  onPageCreated: (pages: any[]) => void;
}

export const usePageCreation = ({ onPageCreated }: UsePageCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { translateSequential } = useTranslation();

  const formatPageContent = (content: string, images: ImageItem[]) => {
    if (!content && images.length === 0) return "";
    
    let enhancedContent = content || "";
    
    if (images.length > 0) {
      enhancedContent += "\n\n<!-- IMAGES -->\n";
      
      images.forEach((image) => {
        const imageMarkup = JSON.stringify({
          type: "image",
          url: image.url,
          position: image.position,
          caption: image.caption || "",
          insertInContent: image.insertInContent,
          order: image.order
        });
        
        enhancedContent += `\n${imageMarkup}\n`;
      });
    }
    
    return enhancedContent;
  };

  const saveNewPage = async (
    title: string,
    content: string,
    path: string,
    imageUrl: string | null,
    icon: string,
    pageType: "normal" | "submenu" | "parent",
    parentPath: string | null,
    images: ImageItem[]
  ) => {
    try {
      const pageId = uuidv4();
      const formattedContent = formatPageContent(content, images);

      // Check if page already exists
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', path)
        .maybeSingle();

      const pageData = {
        title,
        content: formattedContent,
        path,
        image_url: imageUrl,
        icon,
        is_submenu: pageType === "submenu",
        parent_path: pageType === "submenu" ? parentPath : null,
        published: true,
        is_parent: pageType === "parent"
      };

      if (existingPage) {
        const { error: updateError } = await supabase
          .from('custom_pages')
          .update(pageData)
          .eq('id', existingPage.id);
          
        if (updateError) throw updateError;
      } else {
        const { error } = await supabase
          .from('custom_pages')
          .insert({
            id: pageId,
            ...pageData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update menu icons
      const { data: existingIcon } = await supabase
        .from('menu_icons')
        .select('*')
        .eq('path', path)
        .maybeSingle();

      const menuData = {
        label: title,
        icon,
        bg_color: 'bg-blue-200',
        is_submenu: pageType === "submenu",
        parent_path: pageType === "submenu" ? parentPath : null,
        published: true,
        is_parent: pageType === "parent",
        updated_at: new Date().toISOString()
      };

      if (existingIcon) {
        const { error: iconError } = await supabase
          .from('menu_icons')
          .update(menuData)
          .eq('path', path);

        if (iconError) throw iconError;
      } else {
        const { error: iconError } = await supabase
          .from('menu_icons')
          .insert({
            path,
            ...menuData
          });

        if (iconError) throw iconError;
      }

      // Fetch updated pages
      const { data: updatedPages, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return updatedPages;
      
    } catch (error) {
      console.error("Error saving page:", error);
      throw error;
    }
  };

  const handleTranslateAndCreate = async (
    values: PageFormValues,
    uploadedImage: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    try {
      setIsCreating(true);
      setIsTranslating(true);
      
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;

      toast.info("Avvio traduzione automatica in tutte le lingue...");

      const targetLangs: ("en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      // First save the Italian version
      await saveNewPage(
        values.title,
        values.content,
        finalPath,
        uploadedImage,
        values.icon,
        values.pageType,
        values.pageType === "submenu" ? values.parentPath || null : null,
        pageImages
      );

      // Then translate and save for each target language
      if (values.pageType !== "parent") {
        const translations = await translateSequential(
          values.content,
          values.title,
          targetLangs
        );
        
        for (const lang of targetLangs) {
          if (translations[lang]) {
            const translatedPath = `/${lang}${finalPath}`;
            await saveNewPage(
              translations[lang].title,
              translations[lang].content,
              translatedPath,
              uploadedImage,
              values.icon,
              values.pageType,
              values.pageType === "submenu" ? 
                (values.parentPath?.startsWith(`/${lang}`) ? values.parentPath : `/${lang}${values.parentPath}`) : 
                null,
              pageImages
            );
            
            toast.success(`Pagina tradotta in ${lang.toUpperCase()} e salvata con successo`);
          }
        }
      }

      // Fetch final updated pages
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (pagesData) {
        onPageCreated(pagesData);
        toast.success("Pagina creata con successo");
        if (values.pageType !== "parent") {
          toast.info("Traduzioni completate. Vai alla pagina menu per vedere tutte le pagine");
        }
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
