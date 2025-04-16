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
      console.log(`Attempting to delete page and all translations for path: ${path}`);
      
      // Normalize the path by removing the language prefix if present
      const basePath = path.replace(/^\/[a-z]{2}\//, '/');
      console.log(`Normalized path for deletion: ${basePath}`);
      
      // If the original request is for a non-Italian version, we shouldn't delete all translations
      const isNonItalianPath = path.match(/^\/[a-z]{2}\//);
      
      if (isNonItalianPath) {
        // Only delete the specific language version
        const { error: deleteError } = await supabase
          .from('custom_pages')
          .delete()
          .eq('path', path);

        if (deleteError) {
          console.error("Error deleting page:", deleteError);
          throw deleteError;
        }

        // Also delete the menu icon for this specific path
        const { error: menuError } = await supabase
          .from('menu_icons')
          .delete()
          .eq('path', path);

        if (menuError) {
          console.error("Error deleting menu icon:", menuError);
          throw menuError;
        }

        toast.success("Pagina eliminata con successo");
      } else {
        // For Italian pages, delete all translations as well
        // Build an OR condition to find both the main page and all translations
        const pathCondition = `path.eq.${basePath},path.like./??${basePath}`;
        console.log(`Path condition for deletion: ${pathCondition}`);
        
        // Delete all related pages from the custom_pages table
        const { error: deleteError, data: deletedPages } = await supabase
          .from('custom_pages')
          .delete()
          .or(pathCondition)
          .select();

        if (deleteError) {
          console.error("Error deleting pages:", deleteError);
          throw deleteError;
        }

        console.log(`Deleted ${deletedPages?.length || 0} pages from custom_pages`);

        // Delete all related menu icons
        const { error: menuError, data: deletedMenuItems } = await supabase
          .from('menu_icons')
          .delete()
          .or(pathCondition)
          .select();

        if (menuError) {
          console.error("Error deleting menu icons:", menuError);
          throw menuError;
        }

        console.log(`Deleted ${deletedMenuItems?.length || 0} menu icons from menu_icons`);

        toast.success("Pagina e traduzioni eliminate con successo");
      }

      // Retrieve updated pages after deletion
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
      console.log(`Saving page: ${title}, path: ${path}, pageType: ${pageType}, parentPath: ${parentPath}`);
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
      
      // Check if we're working on a translated version by examining the path
      const isTranslatedVersion = values.parentPath && values.parentPath.match(/^\/[a-z]{2}\//);
      const originalLanguage = isTranslatedVersion ? 'it' : undefined;
      
      // Create path based on the page type
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      let finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;
        
      // If we're working with a translated version, keep the language prefix
      if (isTranslatedVersion) {
        const langPrefix = values.parentPath?.match(/^\/([a-z]{2})\//)?.[1];
        
        if (langPrefix && langPrefix !== 'it') {
          // This is a non-Italian page, just save this version
          console.log(`Saving only ${langPrefix} version of the page`);
          
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
          
          toast.success(`Pagina in ${langPrefix.toUpperCase()} salvata con successo`);
          
          const { data: pagesData, error: fetchError } = await supabase
            .from('custom_pages')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fetchError) throw fetchError;
          
          if (pagesData) {
            onPageCreated(pagesData);
            onSuccess();
          }
          
          return;
        }
      }
      
      console.log(`Creating page with path: ${finalPath}, type: ${values.pageType}, parentPath: ${values.parentPath || 'none'}`);
      
      // Save the Italian version first (main version)
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

      toast.info("Avvio traduzione automatica in tutte le lingue...");

      // Translate to all other languages for all page types
      const targetLangs: ("en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      const translations = await translateSequential(
        values.content,
        values.title,
        targetLangs
      );
      
      for (const lang of targetLangs) {
        if (translations[lang]) {
          const translatedPath = `/${lang}${finalPath}`;
          let translatedParentPath = null;
          
          if (values.pageType === "submenu" && values.parentPath) {
            translatedParentPath = `/${lang}${values.parentPath.replace(/^\/[a-z]{2}\//, '/')}`;
          }
          
          console.log(`Creating translated page: ${lang}, path: ${translatedPath}, parentPath: ${translatedParentPath || 'none'}`);
          
          await saveNewPage(
            translations[lang].title,
            translations[lang].content,
            translatedPath,
            imageUrl,
            values.icon,
            values.pageType,
            translatedParentPath,
            pageImages
          );
          
          toast.success(`Pagina tradotta in ${lang.toUpperCase()} e salvata con successo`);
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
    handleTranslateAndCreate,
    deletePageAndTranslations
  };
};
