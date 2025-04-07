
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUploader from "@/components/ImageUploader";

interface ImageInsertionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (imageDataUrl: string) => void;
}

const ImageInsertionDialog: React.FC<ImageInsertionDialogProps> = ({
  isOpen,
  onClose,
  onImageUpload
}) => {
  const handleImageUploaded = (imageUrl: string) => {
    onImageUpload(imageUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserisci immagine</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ImageUploader onImageUpload={handleImageUploaded} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertionDialog;
