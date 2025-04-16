
import React, { useRef } from 'react';
import { toast } from "sonner";
import { ImageDetail } from '@/types/image.types';
import { EditorToolbar } from './toolbar/EditorToolbar';
import { EditorContent } from './EditorContent';
import { useEditorContent } from './hooks/useEditorContent';
import { useEditorPreview } from './hooks/useEditorPreview';
import { useEditorState } from './hooks/useEditorState';
import ImageInsertionDialog from '../admin/form/ImageInsertionDialog';

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
  const editorRef = useRef<HTMLDivElement>(null);
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
    showImageDialog,
    setShowImageDialog,
    toggleEditMode,
    toggleFullscreen
  } = useEditorState();

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

  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
      setShowImageDialog(true);
    }
  };

  const handleContentChange = (newContent: string) => {
    onChange(newContent);
    updateHistory(newContent);
  };

  return (
    <div className={`flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <EditorToolbar
        historyIndex={historyIndex}
        editHistory={editHistory}
        selectedText={selectedText}
        editMode={editMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTextFormat={handleTextFormat}
        onTextAlign={handleTextAlign}
        onOpenImageDialog={handleOpenImageDialog}
        onInsertPhone={handleInsertPhone}
        onInsertMap={handleInsertMap}
        onToggleEditMode={toggleEditMode}
        onToggleFullscreen={toggleFullscreen}
      />

      <EditorContent
        content={content}
        editMode={editMode}
        formattedPreview={formattedPreview}
        onContentChange={handleContentChange}
        onSelect={handleTextareaSelect}
      />

      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={(url, position, caption) => {
          handleInsertImage({ url, position, caption, width: "50%" });
          onImageAdd({ url, position, caption, width: "50%", type: "image" });
        }}
      />
    </div>
  );
};
