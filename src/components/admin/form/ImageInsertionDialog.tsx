
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
          <DialogDescription>
            L'immagine verrà inserita nella posizione corrente del cursore.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ImageUploader onImageUpload={handleImageUploaded} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertionDialog;
