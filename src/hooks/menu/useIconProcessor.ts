import { useCallback } from "react";
import { IconData } from "./types";
import { useMenuQueries } from "./useMenuQueries";

/**
 * Hook per elaborare i dati delle icone del menu
 */
export const useIconProcessor = () => {
  const { checkForChildren } = useMenuQueries();
  
  /**
   * Processa i dati delle pagine per renderli compatibili con le icone del menu
   */
  const processPageData = useCallback((page: any): IconData => {
    // Assicuriamoci che tutti i campi siano definiti
    return {
      id: page.id || `page-${Math.random().toString(36).substring(2, 9)}`,
      path: page.path || '/',
      label: page.title || 'Senza titolo',
      title: page.title || 'Senza titolo',
      icon: page.icon || 'FileText',
      parent_path: page.parent_path || null,
      is_parent: !!page.is_parent,
      translations: {} // Verrà riempito dinamicamente
    };
  }, []);
  
  /**
   * Processa i dati delle icone del menu
   */
  const processMenuIconData = useCallback((menuIcon: any): IconData => {
    // Assicuriamoci che tutti i campi siano definiti
    return {
      id: menuIcon.id || `icon-${Math.random().toString(36).substring(2, 9)}`,
      path: menuIcon.path || '/',
      label: menuIcon.label || 'Senza titolo',
      title: menuIcon.label || 'Senza titolo',
      icon: menuIcon.icon || 'FileText',
      parent_path: menuIcon.parent_path || null,
      is_parent: !!menuIcon.is_parent,
      translations: {} // Verrà riempito dinamicamente
    };
  }, []);
  
  /**
   * Verifica se le icone sono pagine parent (con sottopagine)
   */
  const checkParentStatus = useCallback(async (icons: IconData[]): Promise<IconData[]> => {
    const updatedIcons = [...icons];
    
    for (let i = 0; i < updatedIcons.length; i++) {
      const icon = updatedIcons[i];
      const { count, error } = await checkForChildren(icon.path);
      
      if (!error && count && count > 0) {
        updatedIcons[i] = {
          ...icon,
          is_parent: true
        };
        console.log(`Icon ${icon.path} updated as parent with ${count} children`);
      }
    }
    
    return updatedIcons;
  }, [checkForChildren]);
  
  return {
    processPageData,
    processMenuIconData,
    checkParentStatus
  };
};
