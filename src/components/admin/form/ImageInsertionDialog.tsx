
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, Maximize, Image } from "lucide-react";

interface ImageInsertionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (imageDataUrl: string, position: "left" | "center" | "right" | "full") => void;
}

const ImageInsertionDialog: React.FC<ImageInsertionDialogProps> = ({
  isOpen,
  onClose,
  onImageUpload
}) => {
  const [selectedPosition, setSelectedPosition] = useState<"left" | "center" | "right" | "full">("center");

  const handleImageUploaded = (imageUrl: string) => {
    onImageUpload(imageUrl, selectedPosition);
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Posizione dell'immagine:</label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={selectedPosition === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPosition("left")}
                className="flex items-center"
              >
                <AlignLeft className="h-4 w-4 mr-2" />
                Sinistra
              </Button>
              <Button
                type="button"
                variant={selectedPosition === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPosition("center")}
                className="flex items-center"
              >
                <AlignCenter className="h-4 w-4 mr-2" />
                Centro
              </Button>
              <Button
                type="button"
                variant={selectedPosition === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPosition("right")}
                className="flex items-center"
              >
                <AlignRight className="h-4 w-4 mr-2" />
                Destra
              </Button>
              <Button
                type="button"
                variant={selectedPosition === "full" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPosition("full")}
                className="flex items-center"
              >
                <Maximize className="h-4 w-4 mr-2" />
                Intera
              </Button>
            </div>
          </div>
          <ImageUploader onImageUpload={handleImageUploaded} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertionDialog;
