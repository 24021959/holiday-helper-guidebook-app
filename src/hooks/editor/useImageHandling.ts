
import { useState } from 'react';
import { toast } from "sonner";
import { ImageDetail } from '@/types/image.types';

export const useImageHandling = (
  content: string,
  cursorPosition: number | null,
  updateContent: (newContent: string) => void,
  updateHistory: (newContent: string) => void
) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setImageDialogOpen(true);
    }
  };

  const handleImageInsert = async (imageUrl: string, imagePosition: string, imageCaption?: string) => {
    try {
      const pos = cursorPosition ?? content.length;
      const imageMarkup = `\n[IMAGE:${imageUrl}:${imagePosition}:${imageCaption}]\n`;
      const newContent = 
        content.substring(0, pos) + 
        imageMarkup + 
        content.substring(pos);
      
      updateContent(newContent);
      updateHistory(newContent);
      toast.success("Immagine inserita con successo");
    } catch (error) {
      console.error("Error inserting image:", error);
      toast.error("Errore nell'inserimento dell'immagine");
    }
  };

  return {
    imageDialogOpen,
    setImageDialogOpen,
    handleOpenImageDialog,
    handleImageInsert
  };
};
