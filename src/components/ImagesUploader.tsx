
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload, Image } from 'lucide-react';
import { uploadImage } from '@/integrations/supabase/storage';
import { ImageItem } from '@/pages/Admin';
import { toast } from 'sonner';

interface ImagesUploaderProps {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}

export const ImagesUploader: React.FC<ImagesUploaderProps> = ({ images, setImages }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validazioni
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Solo file JPG e PNG sono supportati');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'immagine non può superare i 5MB');
        return;
      }
      
      try {
        setIsUploading(true);
        const imageUrl = await uploadImage(file);
        
        setImages(prev => [...prev, {
          id: `img-${Date.now()}`,
          url: imageUrl,
          position: 'center',
          caption: ''
        }]);
        
        toast.success('Immagine caricata con successo');
      } catch (error) {
        console.error('Errore durante il caricamento:', error);
        toast.error('Errore durante il caricamento dell\'immagine');
      } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
      }
    }
  };
  
  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };
  
  const handlePositionChange = (id: string, position: 'left' | 'center' | 'right' | 'full') => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, position } : img
    ));
  };
  
  const handleCaptionChange = (id: string, caption: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Immagini ({images.length})</h3>
        <div>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            asChild
          >
            <label htmlFor="image-upload" className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi immagine
            </label>
          </Button>
        </div>
      </div>
      
      {images.length === 0 ? (
        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Nessuna immagine aggiunta
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Le immagini saranno inserite nel contenuto della pagina
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border rounded-md p-3">
              <div className="relative">
                <img
                  src={image.url}
                  alt="Immagine pagina"
                  className="w-full h-auto object-cover rounded-md aspect-video"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemoveImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Posizione:
                  </label>
                  <select
                    value={image.position}
                    onChange={(e) => handlePositionChange(
                      image.id,
                      e.target.value as 'left' | 'center' | 'right' | 'full'
                    )}
                    className="w-full text-sm rounded-md border border-input px-3 py-1"
                  >
                    <option value="left">Sinistra</option>
                    <option value="center">Centro</option>
                    <option value="right">Destra</option>
                    <option value="full">Intera larghezza</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Didascalia:
                  </label>
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                    className="w-full text-sm rounded-md border border-input px-3 py-1"
                    placeholder="Aggiungi una didascalia..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
