
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
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
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-medium">
              <TranslatedText text={`Anteprima: ${title}`} />
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-0">
            {content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageFullscreenPreview;
