
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageSelected?: (imageUrl: string | null) => void;
  onImageUpload?: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onImageUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Verify file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Solo file JPG, PNG e GIF sono supportati');
        toast.error('Solo file JPG, PNG e GIF sono supportati');
        setIsUploading(false);
        return;
      }

      // Verify file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'immagine non può superare i 5MB');
        toast.error('L\'immagine non può superare i 5MB');
        setIsUploading(false);
        return;
      }
      
      // Create a data URL from the file for client-side preview (works in demo mode)
      const reader = new FileReader();
      
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject('Errore nella lettura del file');
          }
        };
        reader.onerror = () => reject('Errore nella lettura del file');
        reader.readAsDataURL(file);
      });
      
      if (onImageSelected) {
        onImageSelected(imageDataUrl);
      }
      
      if (onImageUpload) {
        onImageUpload(imageDataUrl);
      }
      
      toast.success("Immagine caricata con successo");
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Si è verificato un errore durante il caricamento dell'immagine");
      toast.error("Errore durante il caricamento dell'immagine");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image">Immagine</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
        {isUploading && (
          <p className="text-sm text-amber-600">Caricamento in corso...</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
