
import React from 'react';
import TranslatedText from '@/components/TranslatedText';

interface ImagePreviewProps {
  imageUrl: string;
  imagePosition: 'left' | 'center' | 'right' | 'full';
  imageCaption: string;
  imageFile: File | null;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  imagePosition,
  imageCaption,
  imageFile
}) => {
  if (!imageFile && !imageUrl) return null;
  
  return (
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
  );
};
