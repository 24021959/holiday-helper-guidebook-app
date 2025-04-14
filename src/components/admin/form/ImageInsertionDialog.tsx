
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");

  const handleImageSelected = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleInsertImage = () => {
    if (selectedImage) {
      onImageUpload(selectedImage, selectedPosition);
      onClose();
      setSelectedImage(null);
      setCaption("");
    }
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
          
          {selectedImage ? (
            <div className="relative">
              <div className={`preview-container ${
                selectedPosition === "left" ? "editor-preview-image-left" : 
                selectedPosition === "right" ? "editor-preview-image-right" : 
                selectedPosition === "center" ? "editor-preview-image-center" : 
                "editor-preview-image-full"
              }`}>
                <img 
                  src={selectedImage} 
                  alt="Anteprima immagine" 
                  className="w-full h-auto rounded-md"
                />
              </div>
              <div className="clear-both"></div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Didascalia (opzionale):</label>
                <input 
                  type="text" 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Inserisci una didascalia"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={onClose}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleInsertImage}
                >
                  Inserisci
                </Button>
              </div>
            </div>
          ) : (
            <ImageUploader onImageUpload={handleImageSelected} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertionDialog;
