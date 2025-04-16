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
      
      // Determine if we're dealing with a non-Italian version
      const isNonItalianPath = path.match(/^\/[a-z]{2}\//);
      
      if (isNonItalianPath) {
        // For non-Italian pages, only delete the specific page
        console.log(`Deleting only the specified non-Italian page: ${path}`);
        
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
          // Don't throw here, just log the error and continue
        }

        toast.success("Pagina eliminata con successo");
      } else {
        // For Italian pages, delete all translations
        console.log("Deleting Italian page and all its translations");
        
        // Build a comprehensive query to find all related pages
        // This improved query will catch all translations including those with language prefixes
        const translationPatterns = [
          basePath,                       // Italian version (no language prefix)
          `/en${basePath}`,               // English version
          `/fr${basePath}`,               // French version
          `/es${basePath}`,               // Spanish version
          `/de${basePath}`                // German version
        ];
        
        console.log("Looking for pages with these paths:", translationPatterns);
        
        // First, find all translations that match this base path with proper OR conditions
        const { data: translatedPages, error: findError } = await supabase
          .from('custom_pages')
          .select('id, path')
          .or(
            translationPatterns.map(p => `path.eq.${p}`).join(',')
          );
          
        if (findError) {
          console.error("Error finding translated pages:", findError);
          throw findError;
        }
        
        console.log(`Found ${translatedPages?.length || 0} pages to delete:`, translatedPages);
        
        // Delete each page individually to ensure we catch all translations
        if (translatedPages && translatedPages.length > 0) {
          for (const page of translatedPages) {
            console.log(`Deleting page: ${page.path}`);
            
            // Delete the page
            const { error: pageDeleteError } = await supabase
              .from('custom_pages')
              .delete()
              .eq('id', page.id);
              
            if (pageDeleteError) {
              console.error(`Error deleting page ${page.path}:`, pageDeleteError);
              // Continue with other deletions even if one fails
            }
            
            // Delete corresponding menu icon
            const { error: menuDeleteError } = await supabase
              .from('menu_icons')
              .delete()
              .eq('path', page.path);
              
            if (menuDeleteError) {
              console.error(`Error deleting menu icon for ${page.path}:`, menuDeleteError);
              // Continue with other deletions even if one fails
            }
          }
          
          console.log("All pages and their translations have been deleted");
          toast.success("Pagina e traduzioni eliminate con successo");
        } else {
          console.log("No pages found to delete. This is unexpected.");
          toast.error("Nessuna pagina trovata da eliminare");
        }
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

      // Save menu icon
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

      return pageId;
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
      
      // Create path based on the page type
      const sanitizedTitle = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      let finalPath = values.pageType === "submenu" && values.parentPath
        ? `${values.parentPath}/${sanitizedTitle}`
        : `/${sanitizedTitle}`;
      
      // Save the Italian version first (main version)
      const pageId = await saveNewPage(
        values.title,
        values.content,
        finalPath,
        imageUrl,
        values.icon,
        values.pageType,
        values.pageType === "submenu" ? values.parentPath || null : null,
        pageImages
      );

      toast.success("Pagina creata con successo");

      // Start translations
      setIsTranslating(true);
      toast.info("Avvio traduzione automatica in tutte le lingue...");

      // Translate to all other languages
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
        toast.success("Traduzioni completate con successo");
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
