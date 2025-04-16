
import { useState, useEffect } from 'react';

export const useEditorState = () => {
  const [editMode, setEditMode] = useState<'visual' | 'preview'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);

  // Ensure translations are disabled when editor is active
  useEffect(() => {
    document.body.setAttribute('data-no-translation', 'true');
    
    return () => {
      // Only remove the attribute if we're not in the admin area
      if (!window.location.pathname.includes('/admin')) {
        document.body.removeAttribute('data-no-translation');
      }
    };
  }, []);

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
    showMapDialog,
    showPhoneDialog,
    setShowImageDialog,
    setShowMapDialog,
    setShowPhoneDialog,
    toggleEditMode,
    toggleFullscreen
  };
};
