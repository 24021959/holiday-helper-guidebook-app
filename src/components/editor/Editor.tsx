
import React, { useState } from 'react';
import { VisualEditor } from "@/components/editor/VisualEditor";
import { ImageDetail } from '@/types/image.types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  initialEditMode?: 'visual' | 'preview';
  forcePreviewOnly?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange,
  initialEditMode = 'visual',
  forcePreviewOnly = false
}) => {
  const [editMode, setEditMode] = useState<'visual' | 'preview'>(
    forcePreviewOnly ? 'preview' : initialEditMode
  );
  const [images, setImages] = useState<ImageDetail[]>([]);

  const handleImageAdd = (image: ImageDetail) => {
    setImages(prevImages => [...prevImages, image]);
  };

  // If forcePreviewOnly is true, we'll force the preview mode
  React.useEffect(() => {
    if (forcePreviewOnly && editMode !== 'preview') {
      setEditMode('preview');
    }
  }, [forcePreviewOnly, editMode]);

  return (
    <div className="border rounded-md">
      <VisualEditor
        content={value}
        images={images}
        onChange={onChange}
        onImageAdd={handleImageAdd}
        editMode={editMode}
        onEditModeChange={forcePreviewOnly ? undefined : setEditMode}
        forcePreviewOnly={forcePreviewOnly}
      />
    </div>
  );
};
