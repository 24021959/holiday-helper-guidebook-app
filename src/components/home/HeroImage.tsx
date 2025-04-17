
import React, { useState } from 'react';

type HeroImageProps = {
  imageUrl: string;
  altText?: string;
};

const HeroImage: React.FC<HeroImageProps> = ({ imageUrl, altText = "Hero" }) => {
  const [imageSrc, setImageSrc] = useState(imageUrl);

  const handleImageError = () => {
    setImageSrc('/placeholder.svg');
  };

  return (
    <div className="w-full relative">
      <div className="container mx-auto px-4">
        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg my-4">
          <img 
            src={imageSrc} 
            alt={altText} 
            className="w-full h-full object-contain bg-gray-50"
            onError={handleImageError}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
