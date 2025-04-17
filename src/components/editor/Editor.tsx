
import React, { useState, useRef } from 'react';
import { VisualEditor } from "@/components/editor/VisualEditor";
import { ImageDetail } from '@/types/image.types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  initialEditMode?: 'visual' | 'preview';
  forcePreviewOnly?: boolean;
  disableAutoSave?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange,
  initialEditMode = 'visual',
  forcePreviewOnly = false,
  disableAutoSave = false
}) => {
  const [editMode, setEditMode] = useState<'visual' | 'preview'>(
    forcePreviewOnly ? 'preview' : initialEditMode
  );
  const [images, setImages] = useState<ImageDetail[]>([]);
  const editorRef = useRef<any>(null);

  const handleImageAdd = (image: ImageDetail) => {
    setImages(prevImages => [...prevImages, image]);
  };

  // If forcePreviewOnly is true, we'll force the preview mode
  React.useEffect(() => {
    if (forcePreviewOnly && editMode !== 'preview') {
      setEditMode('preview');
    }
  }, [forcePreviewOnly, editMode]);

  // Function to get the current content when save is requested
  const getCurrentContent = () => {
    if (editorRef.current && editorRef.current.getCurrentContent) {
      return editorRef.current.getCurrentContent();
    }
    return value;
  };

  // Function to handle the explicit save request from parent
  const handleSave = () => {
    const currentContent = getCurrentContent();
    onChange(currentContent);
  };

  // Expose getCurrentContent and handleSave to parent via ref
  React.useImperativeHandle(editorRef, () => ({
    getCurrentContent,
    handleSave
  }));

  return (
    <div className="border rounded-md">
      <VisualEditor
        ref={editorRef}
        content={value}
        images={images}
        onChange={onChange}
        onImageAdd={handleImageAdd}
        editMode={editMode}
        onEditModeChange={forcePreviewOnly ? undefined : setEditMode}
        forcePreviewOnly={forcePreviewOnly}
        disableAutoSave={disableAutoSave}
      />
    </div>
  );
};
