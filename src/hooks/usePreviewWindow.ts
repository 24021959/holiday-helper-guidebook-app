
import { useState, useEffect, useRef } from "react";

interface PreviewWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  openInNewWindow?: boolean;
}

/**
 * Hook per gestire l'apertura di un contenuto sia in un dialog che in una nuova finestra.
 * Restituisce true se il contenuto dovrebbe essere mostrato in un dialog, false altrimenti.
 */
export const usePreviewWindow = ({
  isOpen,
  title,
  onClose,
  openInNewWindow = false
}: PreviewWindowProps): boolean => {
  const [shouldRenderDialog, setShouldRenderDialog] = useState<boolean>(true);
  const windowRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Funzione per ripulire risorse quando la finestra viene chiusa
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
    
    // Se il dialog non è aperto, resettiamo tutto
    if (!isOpen) {
      setShouldRenderDialog(true);
      cleanupWindow();
      return;
    }
    
    // Se richiesto di aprire in una nuova finestra
    if (openInNewWindow) {
      try {
        // Tentiamo di aprire una nuova finestra
        const newWindow = window.open('', '_blank', 'width=1000,height=800,menubar=0,toolbar=0,location=0');
        
        if (newWindow) {
          windowRef.current = newWindow;
          setShouldRenderDialog(false);
          
          // Configura monitoraggio per chiusura finestra
          intervalRef.current = window.setInterval(() => {
            if (newWindow.closed) {
              cleanupWindow();
              onClose();
              setShouldRenderDialog(true);
            }
          }, 500) as unknown as number;
          
          // Imposta titolo
          newWindow.document.title = title || 'Anteprima';
        } else {
          // Fallback a dialog se la creazione finestra fallisce
          console.warn("Cannot open a new window. Showing dialog instead.");
          setShouldRenderDialog(true);
        }
      } catch (error) {
        console.error("Error opening preview window:", error);
        setShouldRenderDialog(true);
      }
    } else {
      // Modalità dialog normale
      setShouldRenderDialog(true);
    }
    
    return cleanupWindow;
  }, [isOpen, onClose, openInNewWindow, title]);
  
  return shouldRenderDialog;
};
