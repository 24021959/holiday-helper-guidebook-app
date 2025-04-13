
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Create a data URL from the file for client-side preview
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
      
      // Set the image URL directly (this handles demo mode without needing Supabase)
      setImageUrl(imageDataUrl);
      
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
      {error && (
        <p className="text-sm text-red-600">{error}</p>
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
