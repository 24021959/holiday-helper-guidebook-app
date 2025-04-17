
import React, { createContext, useContext } from 'react';
import { TranslationContextType } from '@/types/translation.types';
import { useTranslationProvider } from '@/hooks/translation/useTranslationProvider';
import { useSequentialTranslation } from '@/hooks/translation/useSequentialTranslation';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Language } from '@/types/translation.types';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
  } = useTranslationProvider();

  const { translateSequential } = useSequentialTranslation(translatePage);

  // Implement the translateAndCloneMenu functionality
  const translateAndCloneMenu = async (
    targetLang: Language,
    progressCallback?: (completed: number, currentPage?: string) => void
  ) => {
    try {
      // 1. Get all Italian pages
      const { data: italianPages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .eq('published', true);

      if (pagesError) {
        throw pagesError;
      }

      if (!italianPages || italianPages.length === 0) {
        toast.error("Nessuna pagina italiana trovata da tradurre");
        return;
      }

      // 2. Translate each page sequentially
      let completedPages = 0;
      const totalPages = italianPages.length;

      for (const page of italianPages) {
        try {
          // Update progress
          if (progressCallback) {
            progressCallback(completedPages, page.title);
          }

          // Create translated path
          const isHomePage = page.path === "/" || page.path === "/home";
          const cleanPath = page.path.replace(/^\/[a-z]{2}\//, '/');
          const translatedPath = isHomePage 
            ? `/${targetLang}` 
            : `/${targetLang}${cleanPath}`;

          // Handle parent path for submenu pages
          let translatedParentPath = null;
          if (page.is_submenu && page.parent_path) {
            const cleanParentPath = page.parent_path.replace(/^\/[a-z]{2}\//, '/');
            translatedParentPath = `/${targetLang}${cleanParentPath}`;
          }

          // Translate content and title
          const { title: translatedTitle, content: translatedContent } = 
            await translatePage(page.content, page.title);

          // Check if translation exists already
          const { data: existingTranslation } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', translatedPath)
            .maybeSingle();

          // Format the page data
          const pageData = {
            title: translatedTitle,
            content: translatedContent,
            path: translatedPath,
            image_url: page.image_url,
            icon: page.icon,
            is_submenu: page.is_submenu,
            parent_path: translatedParentPath,
            published: true,
            is_parent: page.is_parent,
            updated_at: new Date().toISOString()
          };

          // Insert or update the page
          if (existingTranslation) {
            await supabase
              .from('custom_pages')
              .update(pageData)
              .eq('id', existingTranslation.id);
          } else {
            await supabase
              .from('custom_pages')
              .insert({
                ...pageData
              });
          }

          // Also update menu icon
          const menuData = {
            label: translatedTitle,
            path: translatedPath,
            icon: page.icon,
            bg_color: 'bg-blue-200',
            is_submenu: page.is_submenu,
            parent_path: translatedParentPath,
            published: true,
            is_parent: page.is_parent,
            updated_at: new Date().toISOString()
          };

          const { data: existingMenuIcon } = await supabase
            .from('menu_icons')
            .select('*')
            .eq('path', translatedPath)
            .maybeSingle();

          if (existingMenuIcon) {
            await supabase
              .from('menu_icons')
              .update(menuData)
              .eq('path', translatedPath);
          } else {
            await supabase
              .from('menu_icons')
              .insert(menuData);
          }

          // Increment completed count
          completedPages++;
          if (progressCallback) {
            progressCallback(completedPages, page.title);
          }

        } catch (pageError) {
          console.error(`Error translating page ${page.title}:`, pageError);
          // Continue with next page despite error
          completedPages++;
          if (progressCallback) {
            progressCallback(completedPages, page.title);
          }
        }
      }

      toast.success(`Menu tradotto in ${targetLang.toUpperCase()} con successo!`);
    } catch (error) {
      console.error("Error in translateAndCloneMenu:", error);
      toast.error(`Errore durante la traduzione del menu in ${targetLang}`);
      throw error;
    }
  };

  const value = {
    language,
    setLanguage,
    translate,
    translateBulk,
    translatePage,
    translateSequential,
    translateAndCloneMenu,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
