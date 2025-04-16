
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TranslatedText from '@/components/TranslatedText';
import { ImageDialogContent } from './dialog/ImageDialogContent';
import { useImageDialogState } from './hooks/useImageDialogState';

interface EditorImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (imageUrl: string, imagePosition: string, imageCaption: string, file?: File) => Promise<void>;
}

export const EditorImageDialog: React.FC<EditorImageDialogProps> = ({
  open,
  onOpenChange,
  onInsertImage
}) => {
  const {
    imageUrl,
    imagePosition,
    imageCaption,
    uploadingImage,
    imageFile,
    setImageUrl,
    setImagePosition,
    setImageCaption,
    setUploadingImage,
    handleImageFileChange,
    resetState
  } = useImageDialogState();
  
  const handleInsertClick = async () => {
    try {
      setUploadingImage(true);
      await onInsertImage(imageUrl, imagePosition, imageCaption, imageFile || undefined);
      
      // Reset form and close dialog
      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error("Error inserting image:", error);
    } finally {
      setUploadingImage(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        data-no-translation="true"
      >
        <DialogHeader>
          <DialogTitle><TranslatedText text="Inserisci Immagine" disableAutoTranslation={true} /></DialogTitle>
          <DialogDescription>
            <TranslatedText text="Carica un'immagine o inserisci l'URL di un'immagine esistente" disableAutoTranslation={true} />
          </DialogDescription>
        </DialogHeader>
        
        <ImageDialogContent
          imageUrl={imageUrl}
          imagePosition={imagePosition}
          imageCaption={imageCaption}
          imageFile={imageFile}
          uploadingImage={uploadingImage}
          onImageUrlChange={setImageUrl}
          onImageCaptionChange={setImageCaption}
          onImagePositionChange={setImagePosition}
          onImageFileChange={handleImageFileChange}
          onInsertClick={handleInsertClick}
          onCancelClick={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
