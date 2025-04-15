
import { useState, useEffect } from "react";

interface PreviewWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  openInNewWindow?: boolean;
}

export const usePreviewWindow = ({
  isOpen,
  title,
  onClose,
  openInNewWindow = false
}: PreviewWindowProps): boolean => {
  const [shouldRenderDialog, setShouldRenderDialog] = useState(true);
  
  useEffect(() => {
    if (isOpen && openInNewWindow) {
      // Open a new window for the preview
      const previewWindow = window.open('', '_blank');
      
      if (previewWindow) {
        // Set dialog rendering to false since we're opening in new window
        setShouldRenderDialog(false);
        
        // When the preview window is closed, we need to notify our component
        const checkIfClosed = setInterval(() => {
          if (previewWindow.closed) {
            clearInterval(checkIfClosed);
            onClose();
            setShouldRenderDialog(true); // Reset for future openings
          }
        }, 500);
        
        // Clean up on component unmount
        return () => {
          clearInterval(checkIfClosed);
          if (!previewWindow.closed) {
            previewWindow.close();
          }
        };
      } else {
        // If window couldn't be opened (popup blocked), fallback to dialog
        console.warn("Cannot open a new window. Showing dialog instead.");
        setShouldRenderDialog(true);
      }
    } else {
      // For normal dialog mode or when closed
      setShouldRenderDialog(isOpen);
    }
  }, [isOpen, onClose, openInNewWindow, title]);
  
  return shouldRenderDialog;
};
