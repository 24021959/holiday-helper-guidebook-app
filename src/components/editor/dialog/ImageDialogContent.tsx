
import React from 'react';
import { Button } from "@/components/ui/button";
import TranslatedText from '@/components/TranslatedText';
import { ImagePreview } from './ImagePreview';

interface ImageDialogContentProps {
  imageUrl: string;
  imagePosition: 'left' | 'center' | 'right' | 'full';
  imageCaption: string;
  imageFile: File | null;
  uploadingImage: boolean;
  onImageUrlChange: (url: string) => void;
  onImageCaptionChange: (caption: string) => void;
  onImagePositionChange: (position: 'left' | 'center' | 'right' | 'full') => void;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInsertClick: () => void;
  onCancelClick: () => void;
}

export const ImageDialogContent: React.FC<ImageDialogContentProps> = ({
  imageUrl,
  imagePosition,
  imageCaption,
  imageFile,
  uploadingImage,
  onImageUrlChange,
  onImageCaptionChange,
  onImagePositionChange,
  onImageFileChange,
  onInsertClick,
  onCancelClick
}) => {
  return (
    <>
      <div className="grid gap-4 py-4" data-no-translation="true">
        <div className="flex flex-col gap-2" data-no-translation="true">
          <label htmlFor="file-upload" className="text-sm font-medium" data-no-translation="true">
            <TranslatedText text="Carica immagine" disableAutoTranslation={true} />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={onImageFileChange}
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
            onChange={(e) => onImageUrlChange(e.target.value)}
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
            onChange={(e) => onImageCaptionChange(e.target.value)}
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
              onClick={() => onImagePositionChange('left')}
              className="flex-1"
              data-no-translation="true"
            >
              <TranslatedText text="Sinistra" disableAutoTranslation={true} />
            </Button>
            <Button
              type="button"
              variant={imagePosition === 'center' ? 'default' : 'outline'}
              onClick={() => onImagePositionChange('center')}
              className="flex-1"
              data-no-translation="true"
            >
              <TranslatedText text="Centro" disableAutoTranslation={true} />
            </Button>
            <Button
              type="button"
              variant={imagePosition === 'right' ? 'default' : 'outline'}
              onClick={() => onImagePositionChange('right')}
              className="flex-1"
              data-no-translation="true"
            >
              <TranslatedText text="Destra" disableAutoTranslation={true} />
            </Button>
            <Button
              type="button"
              variant={imagePosition === 'full' ? 'default' : 'outline'}
              onClick={() => onImagePositionChange('full')}
              className="flex-1"
              data-no-translation="true"
            >
              <TranslatedText text="Intera" disableAutoTranslation={true} />
            </Button>
          </div>
        </div>
        
        <ImagePreview 
          imageUrl={imageUrl}
          imagePosition={imagePosition}
          imageCaption={imageCaption}
          imageFile={imageFile}
        />
      </div>
      
      <div className="flex justify-end gap-2" data-no-translation="true">
        <Button 
          variant="outline" 
          onClick={onCancelClick}
          data-no-translation="true"
        >
          <TranslatedText text="Annulla" disableAutoTranslation={true} />
        </Button>
        <Button
          onClick={onInsertClick}
          disabled={(!imageFile && !imageUrl) || uploadingImage}
          data-no-translation="true"
        >
          {uploadingImage ? 
            <TranslatedText text="Inserimento..." disableAutoTranslation={true} /> : 
            <TranslatedText text="Inserisci Immagine" disableAutoTranslation={true} />
          }
        </Button>
      </div>
    </>
  );
};
