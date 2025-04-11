
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  onImageSelected: (imageUrl: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For simplicity, we'll just use a placeholder URL
      onImageSelected('https://example.com/image.jpg');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image">Immagine</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleImageSelect} />
      </div>
    </div>
  );
};

export default ImageUploader;
