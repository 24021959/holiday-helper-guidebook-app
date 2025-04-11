
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";

interface PageFullscreenPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  title: string;
}

const PageFullscreenPreview: React.FC<PageFullscreenPreviewProps> = ({
  isOpen,
  onClose,
  content,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-3 border-b bg-white">
            <h2 className="text-lg font-medium flex items-center">
              <Maximize2 className="h-4 w-4 mr-2" />
              <TranslatedText text={`Anteprima: ${title}`} />
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto bg-white">
            <div className="p-6">
              {content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageFullscreenPreview;
