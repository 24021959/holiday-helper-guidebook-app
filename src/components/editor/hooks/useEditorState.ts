
import { useState } from 'react';

export const useEditorState = () => {
  const [editMode, setEditMode] = useState<'visual' | 'preview'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const toggleEditMode = () => setEditMode(editMode === 'visual' ? 'preview' : 'visual');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    if (!isFullscreen && document.documentElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Errore nella richiesta di fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.error(`Errore nell'uscita da fullscreen: ${err.message}`);
      });
    }
  };

  return {
    editMode,
    isFullscreen,
    showImageDialog,
    setShowImageDialog,
    toggleEditMode,
    toggleFullscreen
  };
};
