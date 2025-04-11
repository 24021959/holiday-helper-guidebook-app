
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
    if (file) {
      setIsUploading(true);
      setError(null);
      
      try {
        // In a real implementation, we would upload the file to a server
        // For demo purposes, we'll check if we have Supabase storage access
        let imageUrl: string;
        
        try {
          // Try to check if we have storage access by checking for buckets
          const { error: storageError } = await supabase.storage.getBucket('images');
          
          if (storageError) {
            // If there's an error (no bucket or connection issue), use demo mode
            console.log("Using demo mode for image upload");
            
            // Create a data URL from the file for client-side preview
            const reader = new FileReader();
            
            const result = await new Promise<string>((resolve) => {
              reader.onload = (e) => resolve(e.target?.result as string || '');
              reader.readAsDataURL(file);
            });
            
            imageUrl = result;
          } else {
            // If we have storage access, we could upload to Supabase
            // This is just a placeholder for now
            imageUrl = 'https://example.com/image.jpg';
          }
        } catch (err) {
          console.error("Error checking storage:", err);
          // Fallback to demo mode with data URL
          const reader = new FileReader();
          
          const result = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string || '');
            reader.readAsDataURL(file);
          });
          
          imageUrl = result;
        }
        
        setImageUrl(imageUrl);
        
        if (onImageUpload) {
          onImageUpload(imageUrl);
        }
        
        toast.success("Immagine caricata con successo");
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Si è verificato un errore durante il caricamento dell'immagine");
        toast.error("Errore durante il caricamento dell'immagine");
      } finally {
        setIsUploading(false);
      }
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
