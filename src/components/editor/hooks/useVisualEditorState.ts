
import { useState } from 'react';
import { ImageDetail } from '@/types/image.types';

export const useVisualEditorState = (initialContent: string, initialImages: ImageDetail[]) => {
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  
  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setShowImageDialog(true);
    }
  };

  return {
    editorRef,
    setEditorRef,
    showImageDialog,
    setShowImageDialog,
    handleOpenImageDialog
  };
};
