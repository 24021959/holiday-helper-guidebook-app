
import { toast } from "sonner";
import { ImageDetail } from '@/types/image.types';

export const useImageOperations = (
  content: string, 
  onChange: (content: string) => void,
  updateHistory: (content: string) => void,
  onImageAdd: (image: ImageDetail) => void
) => {
  // Handle image upload from the dialog
  const handleImageUpload = (url: string, position: "left" | "center" | "right" | "full", caption?: string) => {
    const imageDetail: ImageDetail = {
      url,
      position,
      caption,
      width: "50%",
      type: "image"
    };

    handleInsertImage(imageDetail);
    onImageAdd(imageDetail);
    return true; // Return success flag
  };

  // Insert image into content
  const handleInsertImage = (imageDetail: ImageDetail) => {
    const imageMarkup = JSON.stringify({
      type: "image",
      url: imageDetail.url,
      position: imageDetail.position,
      caption: imageDetail.caption || "",
      width: imageDetail.width || "50%"
    });
    
    const newContent = content.trim() 
      ? `${content}\n\n${imageMarkup}\n\n`
      : `${imageMarkup}\n\n`;
    
    onChange(newContent);
    updateHistory(newContent);
    toast.success("Immagine aggiunta con successo");
  };

  // Handle image deletion directly from the editor content
  const handleEditorImageDelete = (index: number) => {
    // Extract and collect all image data from content
    const imageMatches: string[] = [];
    const regex = /\{\"type\":\"image\",.*?\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      imageMatches.push(match[0]);
    }
    
    if (index >= 0 && index < imageMatches.length) {
      // Remove the specific image JSON from content
      const newContent = content.replace(imageMatches[index], '');
      
      // Clean up any consecutive newlines that might be left behind
      const cleanedContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      onChange(cleanedContent);
      updateHistory(cleanedContent);
      toast.success("Immagine eliminata con successo");
    }
  };

  return {
    handleImageUpload,
    handleInsertImage,
    handleEditorImageDelete
  };
};
