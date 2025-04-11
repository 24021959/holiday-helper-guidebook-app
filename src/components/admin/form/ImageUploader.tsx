
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploaderProps {
  imageUrl?: string | null;
  setImageUrl: (url: string | undefined) => void;
  onImageUpload?: (imageUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  imageUrl, 
  setImageUrl,
  onImageUpload 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // In a real implementation, we would upload the file to a server
      // But for now, we're just using a placeholder URL
      setTimeout(() => {
        // Demo implementation with placeholder
        const demoImageUrl = 'https://example.com/image.jpg';
        setImageUrl(demoImageUrl);
        
        if (onImageUpload) {
          onImageUpload(demoImageUrl);
        }
        
        toast.success("Immagine caricata con successo (demo)");
        setIsUploading(false);
      }, 500);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>Immagine</Label>
      <Input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange}
        disabled={isUploading}
      />
      {isUploading && (
        <p className="text-sm text-amber-600">Caricamento in corso...</p>
      )}
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
