
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Clear previous errors
    setError(null);
    
    // Verify file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Solo file JPG e PNG sono supportati');
      toast.error('Solo file JPG e PNG sono supportati');
      return;
    }

    // Verify file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine non può superare i 5MB');
      toast.error('L\'immagine non può superare i 5MB');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        try {
          onImageUpload(e.target.result);
          setIsLoading(false);
        } catch (err) {
          console.error("Error in onImageUpload callback:", err);
          setError('Errore nell\'elaborazione dell\'immagine');
          toast.error('Errore nell\'elaborazione dell\'immagine');
          setIsLoading(false);
        }
      }
    };
    
    reader.onerror = () => {
      setError('Errore nella lettura del file');
      toast.error('Errore nella lettura del file');
      setIsLoading(false);
    };
    
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error reading file:", err);
      setError('Errore nella lettura del file');
      toast.error('Errore nella lettura del file');
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div 
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Elaborazione in corso...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Trascina un'immagine qui, o clicca per selezionarla
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG (max. 5MB)
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-2">
                {error}
              </p>
            )}
          </>
        )}
      </div>
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
