
import { IconData } from "./types";
import { useMenuQueries } from "./useMenuQueries";

export const useIconProcessor = () => {
  const queries = useMenuQueries();

  const processPageData = (page: any): IconData => ({
    id: page.id,
    path: page.path,
    label: page.title,
    title: page.title,
    icon: page.icon || 'FileText',
    parent_path: page.parent_path,
    published: page.published,
    is_parent: false
  });

  const processMenuIconData = (icon: any): IconData => ({
    id: icon.id,
    path: icon.path,
    label: icon.label,
    title: icon.label,
    icon: icon.icon,
    parent_path: icon.parent_path,
    bg_color: icon.bg_color,
    published: icon.published,
    is_parent: false
  });

  const checkParentStatus = async (icons: IconData[]): Promise<IconData[]> => {
    const updatedIcons = [...icons];
    
    for (let i = 0; i < updatedIcons.length; i++) {
      const icon = updatedIcons[i];
      if (icon.path) {
        const { count, error: countError } = await queries.checkForChildren(icon.path);
        if (!countError && count !== null && count > 0) {
          updatedIcons[i] = { ...icon, is_parent: true };
        }
      }
    }
    
    return updatedIcons;
  };

  return {
    processPageData,
    processMenuIconData,
    checkParentStatus
  };
};
