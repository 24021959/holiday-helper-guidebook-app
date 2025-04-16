
import { useState } from 'react';
import { toast } from "sonner";
import { ImageDetail } from '@/types/image.types';

export const useImageControls = (images: ImageDetail[], onImageAdd: (image: ImageDetail) => void, onChange: (content: string) => void) => {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const [showImageControls, setShowImageControls] = useState<number | null>(null);

  const handleImagePositionChange = (index: number, position: "left" | "center" | "right" | "full") => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], position };
    
    updatedImages.forEach((image) => {
      onImageAdd(image);
    });
    
    toast.success(`Posizione dell'immagine cambiata in: ${
      position === "left" ? "Sinistra" : 
      position === "right" ? "Destra" : 
      position === "full" ? "Intera larghezza" : 
      "Centro"
    }`);
  };

  const handleImageWidthChange = (index: number, width: number) => {
    const updatedImages = [...images];
    const widthPercentage = `${width}%`;
    updatedImages[index] = { ...updatedImages[index], width: widthPercentage };
    
    updatedImages.forEach((image) => {
      onImageAdd(image);
    });
  };

  const handleImageCaptionChange = (index: number, caption: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], caption };
    
    updatedImages.forEach((image) => {
      onImageAdd(image);
    });
  };

  const handleDeleteImage = (index: number, content: string) => {
    // Find the image data in the content
    const imageToDelete = images[index];
    if (!imageToDelete) return;
    
    // Create a JSON representation of the image to find in content
    const imageData = JSON.stringify({
      type: "image",
      url: imageToDelete.url,
      position: imageToDelete.position,
      width: imageToDelete.width,
      caption: imageToDelete.caption || ""
    });
    
    // Create a regex pattern to find this or similar image data
    const urlEscaped = imageToDelete.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const imagePattern = new RegExp(`\\{[^}]*"url":"${urlEscaped}"[^}]*\\}`, 'g');
    
    // Replace the image JSON with empty string
    let newContent = content.replace(imagePattern, '');
    
    // Clean up any consecutive newlines that might be left behind
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Update content
    onChange(newContent);
    
    // Remove from images array
    const updatedImages = images.filter((_, idx) => idx !== index);
    updatedImages.forEach(image => onImageAdd(image));
    
    toast.success("Immagine eliminata con successo");
  };

  return {
    hoveredImageIndex,
    setHoveredImageIndex,
    showImageControls,
    setShowImageControls,
    handleImagePositionChange,
    handleImageWidthChange,
    handleImageCaptionChange,
    handleDeleteImage,
  };
};
