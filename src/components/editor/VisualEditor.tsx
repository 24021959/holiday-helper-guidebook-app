
import React, { useRef } from 'react';
import { ImageDetail } from '@/types/image.types';
import { useEditorContent } from './hooks/useEditorContent';
import { useEditorPreview } from './hooks/useEditorPreview';
import { useEditorState } from './hooks/useEditorState';
import { useImageControls } from './hooks/useImageControls';
import { useVisualEditorState } from './hooks/useVisualEditorState';
import { EditorSection } from './EditorSection';
import ImageInsertionDialog from '../admin/form/ImageInsertionDialog';
import { toast } from "sonner";

interface VisualEditorProps {
  content: string;
  images: ImageDetail[];
  onChange: (content: string) => void;
  onImageAdd: (image: ImageDetail) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  content,
  images,
  onChange,
  onImageAdd
}) => {
  const {
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
  } = useVisualEditorState(content, images);

  const {
    cursorPosition,
    setCursorPosition,
    selectedText,
    setSelectedText,
    historyIndex,
    editHistory,
    handleUndo,
    handleRedo,
    handleTextFormat,
    handleTextAlign,
    handleInsertPhone,
    handleInsertMap,
    handleInsertImage,
    updateHistory
  } = useEditorContent(content, onChange);

  const {
    editMode,
    isFullscreen,
    toggleEditMode,
    toggleFullscreen
  } = useEditorState();

  const {
    hoveredImageIndex,
    setHoveredImageIndex,
    showImageControls,
    setShowImageControls,
    handleImagePositionChange,
    handleImageWidthChange,
    handleImageCaptionChange,
    handleDeleteImage
  } = useImageControls(images, onImageAdd, onChange);

  const { formattedPreview } = useEditorPreview(content, images);

  const handleTextareaSelect = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
      
      if (textarea.selectionStart !== textarea.selectionEnd) {
        setSelectedText({
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
          text: textarea.value.substring(
            textarea.selectionStart,
            textarea.selectionEnd
          )
        });
      } else {
        setSelectedText(null);
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    onChange(newContent);
    updateHistory(newContent);
  };

  const handleImageUpload = (url: string, position: "left" | "center" | "right" | "full", caption?: string) => {
    const imageDetail: ImageDetail = {
      url,
      position,
      caption,
      width: "50%",
      type: "image"
    };

    handleInsertImage(imageDetail);
    onImageAdd(imageDetail);
    setShowImageDialog(false);
  };

  const handlePhoneInsert = () => {
    const phoneNumber = prompt("Inserisci il numero di telefono (formato: +39 123 456 7890):");
    if (!phoneNumber) {
      setShowPhoneDialog(false);
      return;
    }
    
    const label = prompt("Inserisci l'etichetta per il numero di telefono:", phoneNumber);
    handleInsertPhone(phoneNumber, label || undefined);
    setShowPhoneDialog(false);
    toast.success("Numero di telefono aggiunto con successo");
  };

  const handleMapInsert = () => {
    const mapUrl = prompt("Inserisci l'URL di Google Maps:");
    if (!mapUrl) {
      setShowMapDialog(false);
      return;
    }
    
    const label = prompt("Inserisci l'etichetta per la posizione:", "Visualizza su Google Maps");
    handleInsertMap(mapUrl, label || undefined);
    setShowMapDialog(false);
    toast.success("Link a Google Maps aggiunto con successo");
  };

  // Handle image deletion directly from the editor content
  const handleEditorImageDelete = (index: number) => {
    // Extract and collect all image data from content
    const imageMatches: string[] = [];
    const regex = /\{\"type\":\"image\",.*?\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      imageMatches.push(match[0]);
    }
    
    if (index >= 0 && index < imageMatches.length) {
      // Remove the specific image JSON from content
      const newContent = content.replace(imageMatches[index], '');
      
      // Clean up any consecutive newlines that might be left behind
      const cleanedContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      onChange(cleanedContent);
      updateHistory(cleanedContent);
      toast.success("Immagine eliminata con successo");
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <EditorSection 
        content={content}
        editMode={editMode}
        isFullscreen={isFullscreen}
        formattedPreview={formattedPreview}
        selectedText={selectedText}
        historyIndex={historyIndex}
        editHistory={editHistory}
        onContentChange={handleContentChange}
        onToggleFullscreen={toggleFullscreen}
        onToggleEditMode={toggleEditMode}
        onOpenImageDialog={handleOpenImageDialog}
        onTextSelect={handleTextareaSelect}
        onTextFormat={handleTextFormat}
        onTextAlign={handleTextAlign}
        onInsertPhone={handleOpenPhoneDialog}
        onInsertMap={handleOpenMapDialog}
        onUndo={handleUndo}
        onRedo={handleRedo}
        images={images}
        onImageDelete={handleEditorImageDelete}
      />

      {showImageDialog && (
        <ImageInsertionDialog
          isOpen={showImageDialog}
          onClose={() => setShowImageDialog(false)}
          onImageUpload={handleImageUpload}
        />
      )}

      {showPhoneDialog && handlePhoneInsert()}
      
      {showMapDialog && handleMapInsert()}
    </div>
  );
};
