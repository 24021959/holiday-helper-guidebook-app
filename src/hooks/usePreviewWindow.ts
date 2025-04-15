
import { useState, useEffect, useRef } from "react";

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
  const [shouldRenderDialog, setShouldRenderDialog] = useState<boolean>(false);
  const windowRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Cleanup function to handle window closing
    const cleanupWindow = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (windowRef.current && !windowRef.current.closed) {
        try {
          windowRef.current.close();
        } catch (e) {
          console.error("Error closing window:", e);
        }
      }
      
      windowRef.current = null;
    };
    
    if (!isOpen) {
      setShouldRenderDialog(false);
      cleanupWindow();
      return;
    }
    
    if (openInNewWindow) {
      try {
        // Try to open a new window
        const newWindow = window.open('', '_blank', 'width=1000,height=800,menubar=0,toolbar=0,location=0');
        
        if (newWindow) {
          windowRef.current = newWindow;
          setShouldRenderDialog(false);
          
          // Set up monitoring for window closure
          intervalRef.current = window.setInterval(() => {
            if (newWindow.closed) {
              cleanupWindow();
              onClose();
              setShouldRenderDialog(true);
            }
          }, 500) as unknown as number;
          
          // Set title and prepare window
          newWindow.document.title = title || 'Anteprima';
          
          return cleanupWindow;
        } else {
          // Window creation failed, fallback to dialog
          console.warn("Cannot open a new window. Showing dialog instead.");
          setShouldRenderDialog(true);
        }
      } catch (error) {
        console.error("Error opening preview window:", error);
        setShouldRenderDialog(true);
      }
    } else {
      // Normal dialog mode
      setShouldRenderDialog(true);
    }
    
    return cleanupWindow;
  }, [isOpen, onClose, openInNewWindow, title]);
  
  return shouldRenderDialog;
};
