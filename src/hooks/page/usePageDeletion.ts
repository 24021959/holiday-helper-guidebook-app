
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for deleting pages and their translations
 */
export const usePageDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Deletes a page and all its translations
   */
  const deletePageAndTranslations = async (path: string) => {
    try {
      setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Deletes the old Index page (the one with just language selection)
   */
  const deleteIndexPage = async () => {
    try {
      setIsDeleting(true);
      console.log("Attempting to delete the Index page");
      
      // Find the Index page (not the /home path)
      const { data: indexPages, error: findError } = await supabase
        .from('custom_pages')
        .select('id, path')
        .eq('path', '/');
        
      if (findError) {
        console.error("Error finding Index page:", findError);
        throw findError;
      }
      
      if (indexPages && indexPages.length > 0) {
        // Delete the Index page
        for (const page of indexPages) {
          console.log(`Deleting Index page with ID: ${page.id}`);
          
          const { error: deleteError } = await supabase
            .from('custom_pages')
            .delete()
            .eq('id', page.id);
            
          if (deleteError) {
            console.error("Error deleting Index page:", deleteError);
            throw deleteError;
          }
        }
        
        // Also delete any menu icon for the Index page
        const { error: menuError } = await supabase
          .from('menu_icons')
          .delete()
          .eq('path', '/');
          
        if (menuError) {
          console.error("Error deleting menu icon for Index page:", menuError);
          // Don't throw here, just log the error and continue
        }
        
        toast.success("Pagina Index eliminata con successo");
        return true;
      } else {
        console.log("No Index page found to delete.");
        return false;
      }
    } catch (error) {
      console.error("Error deleting Index page:", error);
      toast.error("Errore nell'eliminazione della pagina Index");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deletePageAndTranslations,
    deleteIndexPage
  };
};
