
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { ImageItem } from "@/types/image.types";
import { PageType } from "@/types/form.types";
import { usePageFormatting } from "./usePageFormatting";
import { toast } from "sonner";

/**
 * Hook for saving page data to Supabase
 */
export const usePageSaving = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { formatPageContent } = usePageFormatting();

  /**
   * Saves a new page or updates an existing one
   */
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

  return {
    isCreating,
    setIsCreating,
    saveNewPage
  };
};
