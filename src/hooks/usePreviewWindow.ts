
import { useEffect } from "react";
import { generatePreviewHTML } from "@/utils/previewHtmlTemplate";

interface UsePreviewWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  openInNewWindow: boolean;
}

/**
 * Hook to manage opening content in a new window
 */
export const usePreviewWindow = ({ 
  isOpen, 
  title, 
  onClose, 
  openInNewWindow 
}: UsePreviewWindowProps) => {
  useEffect(() => {
    if (isOpen && openInNewWindow) {
      // Get content from the prose element
      const contentHtml = document.querySelector('.prose')?.innerHTML || '';
      
      // Generate the preview HTML
      const previewHTML = generatePreviewHTML(title, contentHtml);
      
      // Open a new window and write the HTML
      const previewWindow = window.open('', '_blank', 'width=1024,height=768');
      if (previewWindow) {
        previewWindow.document.write(previewHTML);
        previewWindow.document.close();
        
        // Close the dialog in the main page
        onClose();
        
        // When the window is closed, execute onClose
        previewWindow.onbeforeunload = () => {
          onClose();
          return null;
        };
      }
    }
  }, [isOpen, openInNewWindow, title, onClose]);

  // Return true if we should render the dialog, false otherwise
  return !openInNewWindow;
};
