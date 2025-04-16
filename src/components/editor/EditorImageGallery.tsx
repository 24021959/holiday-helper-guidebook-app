
import React from 'react';
import { ImageGallery } from './ImageGallery';
import { ImageDetail } from '@/types/image.types';

interface EditorImageGalleryProps {
  images: ImageDetail[];
  content: string;
  hoveredImageIndex: number | null;
  showImageControls: number | null;
  onImageMouseEnter: (index: number) => void;
  onImageMouseLeave: () => void;
  onToggleControls: (index: number) => void;
  onPositionChange: (index: number, position: "left" | "center" | "right" | "full") => void;
  onWidthChange: (index: number, width: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
  onDeleteImage: (index: number) => void;
}

export const EditorImageGallery: React.FC<EditorImageGalleryProps> = ({
  images,
  content,
  hoveredImageIndex,
  showImageControls,
  onImageMouseEnter,
  onImageMouseLeave,
  onToggleControls,
  onPositionChange,
  onWidthChange,
  onCaptionChange,
  onDeleteImage
}) => {
  if (images.length === 0) return null;

  return (
    <ImageGallery
      images={images}
      content={content}
      hoveredImageIndex={hoveredImageIndex}
      showImageControls={showImageControls}
      onImageMouseEnter={onImageMouseEnter}
      onImageMouseLeave={onImageMouseLeave}
      onToggleControls={onToggleControls}
      onPositionChange={onPositionChange}
      onWidthChange={onWidthChange}
      onCaptionChange={onCaptionChange}
      onDeleteImage={onDeleteImage}
    />
  );
};
