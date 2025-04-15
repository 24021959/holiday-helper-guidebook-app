import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import { v4 as uuidv4 } from "uuid";
import { ImageItem } from "@/types/image.types";
import { PageFormValues, PageType } from "@/types/form.types";

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

  const deletePageAndTranslations = async (path: string) => {
    try {
      const basePath = path.replace(/^\/[a-z]{2}\//, '/');
      
      const { error: deleteError } = await supabase
        .from('custom_pages')
        .delete()
        .or(`path.eq.${basePath},path.like./en${basePath},path.like./fr${basePath},path.like./es${basePath},path.like./de${basePath}`);

      if (deleteError) throw deleteError;

      const { error: menuError } = await supabase
        .from('menu_icons')
        .delete()
        .or(`path.eq.${basePath},path.like./en${basePath},path.like./fr${basePath},path.like./es${basePath},path.like./de${basePath}`);

      if (menuError) throw menuError;

      toast.success("Pagina e traduzioni eliminate con successo");

      const { data: updatedPages, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return updatedPages;

    } catch (error) {
      console.error("Error deleting page and translations:", error);
      toast.error("Errore nell'eliminazione della pagina e delle traduzioni");
      throw error;
    }
  };

  const saveNewPage = async (
    title: string,
    content: string,
    path: string,
    imageUrl: string | null,
    icon: string,
    pageType: PageType,
    parentPath: string | null,
    images: ImageItem[]
  ) => {
    try {
      const pageId = uuidv4();
      const formattedContent = formatPageContent(content, images);

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

        if (!path.match(/^\/[a-z]{2}\//)) {
          const translations = await translateSequential(formattedContent, title, ['en', 'fr', 'es', 'de']);
          
          for (const lang of Object.keys(translations)) {
            if (lang !== 'it') {
              const translatedPath = `/${lang}${path}`;
              const translatedParentPath = parentPath ? `/${lang}${parentPath}` : null;
              
              await saveNewPage(
                translations[lang].title,
                translations[lang].content,
                translatedPath,
                imageUrl,
                icon,
                pageType,
                translatedParentPath,
                images
              );
            }
          }
        }
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
    imageUrl: string | null,
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
      
      await saveNewPage(
        values.title,
        values.content,
        finalPath,
        imageUrl,
        values.icon,
        values.pageType,
        values.pageType === "submenu" ? values.parentPath || null : null,
        pageImages
      );

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
              imageUrl,
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
    handleTranslateAndCreate,
    deletePageAndTranslations
  };
};
