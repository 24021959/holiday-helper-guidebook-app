
import { ImageItem } from "@/types/image.types";

/**
 * Hook for formatting page content prior to saving
 */
export const usePageFormatting = () => {
  /**
   * Formats page content by incorporating images
   */
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

  return {
    formatPageContent
  };
};
