
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inserisci Immagine</DialogTitle>
          <DialogDescription>
            Carica un'immagine o inserisci l'URL di un'immagine esistente
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Carica immagine
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="border p-2 rounded-md text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="image-url" className="text-sm font-medium">
              URL Immagine (opzionale)
            </label>
            <input
              id="image-url"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="border p-2 rounded-md"
              disabled={!!imageFile}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="image-caption" className="text-sm font-medium">
              Didascalia (opzionale)
            </label>
            <input
              id="image-caption"
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Descrizione dell'immagine"
              className="border p-2 rounded-md"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Posizione</label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={imagePosition === 'left' ? 'default' : 'outline'}
                onClick={() => setImagePosition('left')}
                className="flex-1"
              >
                Sinistra
              </Button>
              <Button
                type="button"
                variant={imagePosition === 'center' ? 'default' : 'outline'}
                onClick={() => setImagePosition('center')}
                className="flex-1"
              >
                Centro
              </Button>
              <Button
                type="button"
                variant={imagePosition === 'right' ? 'default' : 'outline'}
                onClick={() => setImagePosition('right')}
                className="flex-1"
              >
                Destra
              </Button>
              <Button
                type="button"
                variant={imagePosition === 'full' ? 'default' : 'outline'}
                onClick={() => setImagePosition('full')}
                className="flex-1"
              >
                Intera
              </Button>
            </div>
          </div>
          
          {(imageFile || imageUrl) && (
            <div className="mt-2 border rounded-md p-2">
              <p className="text-sm font-medium mb-2">Anteprima:</p>
              <div className={`
                ${imagePosition === 'left' ? 'float-left mr-4' : ''}
                ${imagePosition === 'right' ? 'float-right ml-4' : ''}
                ${imagePosition === 'center' ? 'mx-auto' : ''}
                ${imagePosition === 'full' ? 'w-full' : 'max-w-[60%]'}
              `}>
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                  alt="Anteprima"
                  className="max-w-full h-auto rounded-md"
                />
                {imageCaption && (
                  <p className="text-xs text-center text-gray-500 mt-1">{imageCaption}</p>
                )}
              </div>
              <div className="clear-both"></div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleInsertClick}
            disabled={(!imageFile && !imageUrl) || uploadingImage}
          >
            {uploadingImage ? "Inserimento..." : "Inserisci Immagine"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
