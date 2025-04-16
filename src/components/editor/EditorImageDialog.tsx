
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TranslatedText from '@/components/TranslatedText';

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
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePosition, setImagePosition] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
      // Show preview of the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const handleInsertClick = async () => {
    try {
      setUploadingImage(true);
      await onInsertImage(imageUrl, imagePosition, imageCaption, imageFile || undefined);
      
      // Reset form and close dialog
      setImageFile(null);
      setImageUrl('');
      setImageCaption('');
      setImagePosition('center');
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
        
        <div className="grid gap-4 py-4" data-no-translation="true">
          <div className="flex flex-col gap-2" data-no-translation="true">
            <label htmlFor="file-upload" className="text-sm font-medium" data-no-translation="true">
              <TranslatedText text="Carica immagine" disableAutoTranslation={true} />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="border p-2 rounded-md text-sm"
              data-no-translation="true"
            />
          </div>
          
          <div className="flex flex-col gap-2" data-no-translation="true">
            <label htmlFor="image-url" className="text-sm font-medium" data-no-translation="true">
              <TranslatedText text="URL Immagine (opzionale)" disableAutoTranslation={true} />
            </label>
            <input
              id="image-url"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="border p-2 rounded-md"
              disabled={!!imageFile}
              data-no-translation="true"
            />
          </div>
          
          <div className="flex flex-col gap-2" data-no-translation="true">
            <label htmlFor="image-caption" className="text-sm font-medium" data-no-translation="true">
              <TranslatedText text="Didascalia (opzionale)" disableAutoTranslation={true} />
            </label>
            <input
              id="image-caption"
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Descrizione dell'immagine"
              className="border p-2 rounded-md"
              data-no-translation="true"
            />
          </div>
          
          <div className="flex flex-col gap-2" data-no-translation="true">
            <label className="text-sm font-medium" data-no-translation="true">
              <TranslatedText text="Posizione" disableAutoTranslation={true} />
            </label>
            <div className="flex space-x-2" data-no-translation="true">
              <Button
                type="button"
                variant={imagePosition === 'left' ? 'default' : 'outline'}
                onClick={() => setImagePosition('left')}
                className="flex-1"
                data-no-translation="true"
              >
                <TranslatedText text="Sinistra" disableAutoTranslation={true} />
              </Button>
              <Button
                type="button"
                variant={imagePosition === 'center' ? 'default' : 'outline'}
                onClick={() => setImagePosition('center')}
                className="flex-1"
                data-no-translation="true"
              >
                <TranslatedText text="Centro" disableAutoTranslation={true} />
              </Button>
              <Button
                type="button"
                variant={imagePosition === 'right' ? 'default' : 'outline'}
                onClick={() => setImagePosition('right')}
                className="flex-1"
                data-no-translation="true"
              >
                <TranslatedText text="Destra" disableAutoTranslation={true} />
              </Button>
              <Button
                type="button"
                variant={imagePosition === 'full' ? 'default' : 'outline'}
                onClick={() => setImagePosition('full')}
                className="flex-1"
                data-no-translation="true"
              >
                <TranslatedText text="Intera" disableAutoTranslation={true} />
              </Button>
            </div>
          </div>
          
          {(imageFile || imageUrl) && (
            <div className="mt-2 border rounded-md p-2" data-no-translation="true">
              <p className="text-sm font-medium mb-2" data-no-translation="true">
                <TranslatedText text="Anteprima:" disableAutoTranslation={true} />
              </p>
              <div 
                className={`
                  ${imagePosition === 'left' ? 'float-left mr-4' : ''}
                  ${imagePosition === 'right' ? 'float-right ml-4' : ''}
                  ${imagePosition === 'center' ? 'mx-auto' : ''}
                  ${imagePosition === 'full' ? 'w-full' : 'max-w-[60%]'}
                `}
                data-no-translation="true"
              >
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                  alt="Anteprima"
                  className="max-w-full h-auto rounded-md"
                  data-no-translation="true"
                />
                {imageCaption && (
                  <p className="text-xs text-center text-gray-500 mt-1" data-no-translation="true">{imageCaption}</p>
                )}
              </div>
              <div className="clear-both"></div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2" data-no-translation="true">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-no-translation="true"
          >
            <TranslatedText text="Annulla" disableAutoTranslation={true} />
          </Button>
          <Button
            onClick={handleInsertClick}
            disabled={(!imageFile && !imageUrl) || uploadingImage}
            data-no-translation="true"
          >
            {uploadingImage ? 
              <TranslatedText text="Inserimento..." disableAutoTranslation={true} /> : 
              <TranslatedText text="Inserisci Immagine" disableAutoTranslation={true} />
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
