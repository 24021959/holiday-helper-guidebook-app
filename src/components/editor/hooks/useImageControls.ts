
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
    const imagePlaceholder = `[IMAGE_${index}]`;
    const newContent = content.replace(imagePlaceholder, '');
    onChange(newContent);
    
    const updatedImages = images.filter((_, idx) => idx !== index);
    
    updatedImages.forEach((image, newIdx) => {
      onImageAdd(image);
      const oldPlaceholder = `[IMAGE_${newIdx + 1}]`;
      const newPlaceholder = `[IMAGE_${newIdx}]`;
      const updatedContent = newContent.replace(oldPlaceholder, newPlaceholder);
      onChange(updatedContent);
    });
    
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
