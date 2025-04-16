
import React from 'react';
import { useEditorContent } from '@/components/editor/hooks/useEditorContent';
import { useEditorPreview } from '@/components/editor/hooks/useEditorPreview';
import { useEditorState } from '@/components/editor/hooks/useEditorState';
import { useImageControls } from '@/components/editor/hooks/useImageControls';
import { ImageGallery } from '@/components/editor/ImageGallery';
import { EditorArea } from '@/components/editor/EditorArea';
import ImageInsertionDialog from './form/ImageInsertionDialog';
import { ImageDetail } from '@/types/image.types';
import {
  FormatButtons,
  AlignmentButtons,
  HeadingsDropdown,
  InsertButtons,
  ViewButtons,
  HistoryButtons
} from '@/components/editor/toolbar/EditorToolbarButtons';

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

  const handleOpenImageDialog = () => {
    if (document.querySelector('textarea')) {
      setCursorPosition((document.querySelector('textarea') as HTMLTextAreaElement).selectionStart);
      setShowImageDialog(true);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md mb-4 sticky top-0 z-10">
        <HistoryButtons
          historyIndex={historyIndex}
          editHistory={editHistory}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
        
        <FormatButtons
          selectedText={selectedText}
          onTextFormat={handleTextFormat}
        />
        
        <AlignmentButtons
          selectedText={selectedText}
          onTextAlign={handleTextAlign}
        />
        
        <HeadingsDropdown
          selectedText={selectedText}
          onTextFormat={handleTextFormat}
        />
        
        <InsertButtons
          onOpenImageDialog={handleOpenImageDialog}
          onInsertPhone={handleInsertPhone}
          onInsertMap={handleInsertMap}
        />
        
        <ViewButtons
          editMode={editMode}
          onToggleEditMode={toggleEditMode}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      <EditorArea
        content={content}
        editMode={editMode}
        formattedPreview={formattedPreview}
        onContentChange={onChange}
        onSelect={handleTextareaSelect}
      />

      {images.length > 0 && (
        <ImageGallery
          images={images}
          content={content}
          hoveredImageIndex={hoveredImageIndex}
          showImageControls={showImageControls}
          onImageMouseEnter={setHoveredImageIndex}
          onImageMouseLeave={() => showImageControls === null && setHoveredImageIndex(null)}
          onToggleControls={(index) => setShowImageControls(showImageControls === index ? null : index)}
          onPositionChange={handleImagePositionChange}
          onWidthChange={handleImageWidthChange}
          onCaptionChange={handleImageCaptionChange}
          onDeleteImage={(index) => handleDeleteImage(index, content)}
        />
      )}

      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleInsertImage}
      />
    </div>
  );
};
