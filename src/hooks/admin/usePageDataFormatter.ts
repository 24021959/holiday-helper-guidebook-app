
import { PageData } from "@/types/page.types";

export const usePageDataFormatter = () => {
  const formatPageData = (page: any): PageData => ({
    id: page.id,
    title: page.title,
    content: page.content,
    path: page.path,
    imageUrl: page.image_url,
    icon: page.icon,
    listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
    listItems: page.list_items,
    isSubmenu: page.is_submenu || false,
    parentPath: page.parent_path || undefined,
    pageImages: page.content ? extractImagesFromContent(page.content) : [],
    published: page.published,
    is_parent: page.is_parent || false
  });

  const extractImagesFromContent = (content: string) => {
    try {
      const images: { url: string; position: "left" | "center" | "right" | "full"; caption?: string; }[] = [];
      if (!content.includes('<!-- IMAGES -->')) return [];
      
      const imagesSection = content.split('<!-- IMAGES -->')[1];
      if (!imagesSection) return [];
      
      const imageObjects = imagesSection.match(/\n(\{.*?\})\n/g);
      if (!imageObjects) return [];
      
      imageObjects.forEach(imgStr => {
        try {
          const img = JSON.parse(imgStr.trim());
          if (img.type === 'image' && img.url) {
            images.push({
              url: img.url,
              position: img.position || 'center',
              caption: img.caption || ''
            });
          }
        } catch (e) {
          console.error('Error parsing image JSON:', e);
        }
      });
      
      return images;
    } catch (error) {
      console.error('Error extracting images:', error);
      return [];
    }
  };

  return {
    formatPageData
  };
};
