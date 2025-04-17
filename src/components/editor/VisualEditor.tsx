
import React from 'react';
import { ImageDetail } from '@/types/image.types';
import { useEditorContent } from './hooks/useEditorContent';
import { useEditorPreview } from './hooks/useEditorPreview';
import { useEditorState } from './hooks/useEditorState';
import { useVisualEditorState } from './hooks/useVisualEditorState';
import { useImageOperations } from './hooks/useImageOperations';
import { useSpecialInserts } from './hooks/useSpecialInserts';
import { EditorSection } from './EditorSection';
import { EditorDialogs } from './EditorDialogs';

interface VisualEditorProps {
  content: string;
  images: ImageDetail[];
  onChange: (content: string) => void;
  onImageAdd: (image: ImageDetail) => void;
  editMode?: 'visual' | 'preview';
  onEditModeChange?: (mode: 'visual' | 'preview') => void;
  forcePreviewOnly?: boolean;
  disableAutoSave?: boolean;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  content,
  images,
  onChange,
  onImageAdd,
  editMode: externalEditMode,
  onEditModeChange,
  forcePreviewOnly = false,
  disableAutoSave = false
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
    updateHistory
  } = useEditorContent(content, disableAutoSave ? () => {} : onChange);

  // Use the external edit mode if provided, otherwise use the internal state
  const {
    editMode: internalEditMode,
    isFullscreen,
    toggleEditMode: internalToggleEditMode,
    toggleFullscreen
  } = useEditorState();

  const editMode = externalEditMode || internalEditMode;
  
  const toggleEditMode = () => {
    if (forcePreviewOnly) return; // Don't toggle if preview only is forced
    
    if (onEditModeChange) {
      onEditModeChange(editMode === 'visual' ? 'preview' : 'visual');
    } else {
      internalToggleEditMode();
    }
  };

  const { formattedPreview } = useEditorPreview(content, images);

  const {
    handleImageUpload,
    handleEditorImageDelete
  } = useImageOperations(content, disableAutoSave ? () => {} : onChange, updateHistory, onImageAdd);

  const {
    handlePhoneInsert,
    handleMapInsert
  } = useSpecialInserts(content, cursorPosition, disableAutoSave ? () => {} : onChange, updateHistory);

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
    if (!disableAutoSave) {
      onChange(newContent);
    }
    updateHistory(newContent);
  };

  // This function will be called by parent when explicit save is requested
  const getCurrentContent = (): string => {
    return editHistory[historyIndex] || content;
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
        onOpenImageDialog={() => {}} // Removed image button functionality
        onTextSelect={handleTextareaSelect}
        onTextFormat={handleTextFormat}
        onTextAlign={handleTextAlign}
        onInsertPhone={handleOpenPhoneDialog}
        onInsertMap={handleOpenMapDialog}
        onUndo={handleUndo}
        onRedo={handleRedo}
        images={images}
        onImageDelete={handleEditorImageDelete}
        forcePreviewOnly={forcePreviewOnly}
      />

      <EditorDialogs
        showImageDialog={showImageDialog}
        showPhoneDialog={showPhoneDialog}
        showMapDialog={showMapDialog}
        onCloseImageDialog={() => setShowImageDialog(false)}
        onImageUpload={handleImageUpload}
        onHandlePhoneInsert={handlePhoneInsert}
        onHandleMapInsert={handleMapInsert}
      />
    </div>
  );
};
