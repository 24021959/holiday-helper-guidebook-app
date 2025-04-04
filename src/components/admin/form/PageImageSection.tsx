
import React from "react";
import { Label } from "@/components/ui/label";
import ImageUploader from "../../ImageUploader";

interface PageImageSectionProps {
  imageUrl: string;
  onImageUploaded: (url: string) => void;
}

export const PageImageSection: React.FC<PageImageSectionProps> = ({
  imageUrl,
  onImageUploaded
}) => {
  return (
    <div className="space-y-2">
      <Label>Immagine della pagina</Label>
      <div className="space-y-2">
        {imageUrl && (
          <div className="mb-2">
            <img 
              src={imageUrl} 
              alt="Anteprima" 
              className="w-full max-h-32 object-cover rounded-md"
            />
          </div>
        )}
        <ImageUploader onImageUpload={onImageUploaded} />
      </div>
    </div>
  );
};
