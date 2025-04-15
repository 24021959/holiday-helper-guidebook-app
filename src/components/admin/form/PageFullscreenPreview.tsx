import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";
import { usePreviewWindow } from "@/hooks/usePreviewWindow";

interface PageFullscreenPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  title: string;
  openInNewWindow?: boolean;
}

const PageFullscreenPreview: React.FC<PageFullscreenPreviewProps> = ({
  isOpen,
  onClose,
  content,
  title,
  openInNewWindow = false
}) => {
  // Use our custom hook to manage the preview window
  const shouldRenderDialog = usePreviewWindow({
    isOpen,
    title,
    onClose,
    openInNewWindow
  });

  // If we shouldn't render the dialog (because it's opening in a new window), return null
  if (!shouldRenderDialog) {
    return null;
  }

  // Otherwise, show the normal dialog - wrapped in a single element to avoid React.Children.only errors
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-screen h-screen p-0 overflow-hidden inset-0 m-0 rounded-none border-0 fixed top-0 left-0">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-3 border-b bg-white z-10 sticky top-0">
            <h2 className="text-lg font-medium flex items-center">
              <Maximize2 className="h-4 w-4 mr-2" />
              <TranslatedText text={`Anteprima: ${title}`} />
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
              aria-label="Chiudi"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto bg-white">
            <div className="fullscreen-preview-container">
              <div className="fullscreen-preview-content">
                {content}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageFullscreenPreview;
