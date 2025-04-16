
import { useState } from 'react';

export interface ImageDialogState {
  imageUrl: string;
  imagePosition: 'left' | 'center' | 'right' | 'full';
  imageCaption: string;
  uploadingImage: boolean;
  imageFile: File | null;
}

export function useImageDialogState() {
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
  
  const resetState = () => {
    setImageFile(null);
    setImageUrl('');
    setImageCaption('');
    setImagePosition('center');
  };
  
  return {
    imageUrl,
    imagePosition,
    imageCaption,
    uploadingImage,
    imageFile,
    setImageUrl,
    setImagePosition,
    setImageCaption,
    setUploadingImage,
    setImageFile,
    handleImageFileChange,
    resetState
  };
}
