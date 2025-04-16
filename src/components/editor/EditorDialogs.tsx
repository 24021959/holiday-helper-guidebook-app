
import React, { useEffect } from 'react';
import ImageInsertionDialog from '../admin/form/ImageInsertionDialog';

interface EditorDialogsProps {
  showImageDialog: boolean;
  showPhoneDialog: boolean;
  showMapDialog: boolean;
  onCloseImageDialog: () => void;
  onImageUpload: (url: string, position: "left" | "center" | "right" | "full", caption?: string) => boolean;
  onHandlePhoneInsert: () => void;
  onHandleMapInsert: () => void;
}

export const EditorDialogs: React.FC<EditorDialogsProps> = ({
  showImageDialog,
  showPhoneDialog,
  showMapDialog,
  onCloseImageDialog,
  onImageUpload,
  onHandlePhoneInsert,
  onHandleMapInsert
}) => {
  // Handle special dialogs via side effects
  useEffect(() => {
    if (showPhoneDialog) {
      onHandlePhoneInsert();
    }
  }, [showPhoneDialog, onHandlePhoneInsert]);

  useEffect(() => {
    if (showMapDialog) {
      onHandleMapInsert();
    }
  }, [showMapDialog, onHandleMapInsert]);

  return (
    <>
      {showImageDialog && (
        <ImageInsertionDialog
          isOpen={showImageDialog}
          onClose={onCloseImageDialog}
          onImageUpload={onImageUpload}
        />
      )}
    </>
  );
};
