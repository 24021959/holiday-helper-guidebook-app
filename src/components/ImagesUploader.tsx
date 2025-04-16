import React, { useState, useCallback } from 'react';
import { X, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImage } from '@/integrations/supabase/storage';
import { toast } from 'sonner';
import { ImageUploadItem } from '@/types/image.types';

interface ImagesUploaderProps {
  images: ImageUploadItem[];
  onChange: (images: ImageUploadItem[]) => void;
  maxImages?: number;
}

const ImagesUploader: React.FC<ImagesUploaderProps> = ({ 
  images, 
  onChange, 
  maxImages = 5 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Puoi caricare al massimo ${maxImages} immagini`);
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const url = await uploadImage(file);
        return {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url,
          position: 'center' as const,
          caption: '',
          width: '50%', // Aggiungo il campo width richiesto
        };
      });

      const newImages = await Promise.all(uploadPromises);
      onChange([...images, ...newImages]);
      toast.success('Immagini caricate con successo');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Errore durante il caricamento delle immagini');
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be selected again
      e.target.value = '';
    }
  }, [images, onChange, maxImages]);

  const handleRemoveImage = useCallback((id: string) => {
    onChange(images.filter(img => img.id !== id));
  }, [images, onChange]);

  const handleChangePosition = useCallback((id: string, position: 'left' | 'center' | 'right' | 'full') => {
    onChange(images.map(img => 
      img.id === id ? { ...img, position } : img
    ));
  }, [images, onChange]);

  const handleChangeCaption = useCallback((id: string, caption: string) => {
    onChange(images.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
  }, [images, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Immagini ({images.length}/{maxImages})
        </Label>
        
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple
            disabled={isUploading || images.length >= maxImages}
            onChange={handleUploadImage}
            className="hidden"
            id="images-upload"
          />
          <Label
            htmlFor="images-upload"
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                isUploading || images.length >= maxImages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
              }
            `}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Caricamento...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                {images.length === 0 ? 'Carica immagini' : 'Aggiungi altre immagini'}
              </span>
            )}
          </Label>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border rounded-md p-3 space-y-3 bg-white">
              <div className="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={image.url}
                  alt={image.caption || 'Immagine senza didascalia'}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`caption-${image.id}`} className="text-xs text-gray-500 mb-1 block">
                    Didascalia
                  </Label>
                  <Input
                    id={`caption-${image.id}`}
                    value={image.caption}
                    onChange={(e) => handleChangeCaption(image.id, e.target.value)}
                    placeholder="Aggiungi una didascalia (opzionale)"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">
                    Posizione immagine
                  </Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={image.position === 'left' ? 'default' : 'outline'}
                      className={image.position === 'left' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      onClick={() => handleChangePosition(image.id, 'left')}
                    >
                      Sinistra
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={image.position === 'center' ? 'default' : 'outline'}
                      className={image.position === 'center' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      onClick={() => handleChangePosition(image.id, 'center')}
                    >
                      Centro
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={image.position === 'right' ? 'default' : 'outline'}
                      className={image.position === 'right' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      onClick={() => handleChangePosition(image.id, 'right')}
                    >
                      Destra
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={image.position === 'full' ? 'default' : 'outline'}
                      className={image.position === 'full' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      onClick={() => handleChangePosition(image.id, 'full')}
                    >
                      Pieno
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-md p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-1">Nessuna immagine caricata</p>
            <p className="text-gray-400 text-sm">Clicca sul pulsante "Carica immagini" per aggiungere foto</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesUploader;
