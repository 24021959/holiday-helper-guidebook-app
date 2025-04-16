
import { useState, useRef } from 'react';
import { ImageDetail } from '@/types/image.types';

export const useVisualEditorState = (initialContent: string, initialImages: ImageDetail[]) => {
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);

  // Dialog reference for managing focus
  const dialogRef = useRef<HTMLDivElement | null>(null);
  
  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setShowImageDialog(true);
    }
  };

  const handleOpenPhoneDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setShowPhoneDialog(true);
    }
  };

  const handleOpenMapDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setShowMapDialog(true);
    }
  };

  return {
    editorRef,
    setEditorRef,
    showImageDialog,
    setShowImageDialog,
    showPhoneDialog,
    setShowPhoneDialog,
    showMapDialog,
    setShowMapDialog,
    handleOpenImageDialog,
    handleOpenPhoneDialog,
    handleOpenMapDialog,
    dialogRef
  };
};
