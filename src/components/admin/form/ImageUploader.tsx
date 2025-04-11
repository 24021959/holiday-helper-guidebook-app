
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  imageUrl?: string | null;
  setImageUrl: (url: string | undefined) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, setImageUrl }) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For simplicity, just using a placeholder URL
      setImageUrl('https://example.com/image.jpg');
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>Immagine</Label>
      <Input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange}
      />
      {imageUrl && (
        <div className="mt-2">
          <p>Immagine selezionata</p>
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="mt-2 max-h-40 rounded border"
          />
        </div>
      )}
    </div>
  );
};
