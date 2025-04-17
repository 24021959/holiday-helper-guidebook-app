
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";

interface PagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  title: string;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  isOpen,
  onClose,
  content,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-3 border-b bg-white z-10 sticky top-0">
            <h2 className="text-lg font-medium flex items-center">
              <Maximize2 className="h-4 w-4 mr-2" />
              <TranslatedText text={`Anteprima: ${title}`} disableAutoTranslation={true} />
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="h-8 w-8 p-0 flex items-center justify-center"
              aria-label="Chiudi"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto bg-white p-4">
            <div className="preview-container">
              {content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PagePreview;
