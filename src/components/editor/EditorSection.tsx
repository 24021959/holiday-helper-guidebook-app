
import React from 'react';
import { EditorToolbar } from './EditorToolbar';
import { EditorContent } from './EditorContent';
import { ImageDetail } from '@/types/image.types';

interface EditorSectionProps {
  content: string;
  editMode: 'visual' | 'preview';
  isFullscreen: boolean;
  formattedPreview: string;
  selectedText: { start: number; end: number; text: string; } | null;
  historyIndex: number;
  editHistory: string[];
  onContentChange: (content: string) => void;
  onToggleFullscreen: () => void;
  onToggleEditMode: () => void;
  onOpenImageDialog: () => void;
  onTextSelect: () => void;
  onTextFormat: (format: string) => void;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  images: ImageDetail[];
  onImageDelete?: (index: number) => void;
}

export const EditorSection: React.FC<EditorSectionProps> = ({
  content,
  editMode,
  isFullscreen,
  formattedPreview,
  selectedText,
  historyIndex,
  editHistory,
  onContentChange,
  onToggleFullscreen,
  onToggleEditMode,
  onOpenImageDialog,
  onTextSelect,
  onTextFormat,
  onTextAlign,
  onInsertPhone,
  onInsertMap,
  onUndo,
  onRedo,
  images,
  onImageDelete
}) => {
  return (
    <>
      <EditorToolbar
        expanded={isFullscreen}
        previewMode={editMode === 'preview'}
        selectedText={selectedText}
        historyIndex={historyIndex}
        editHistory={editHistory}
        onToggleExpand={onToggleFullscreen}
        onTogglePreview={onToggleEditMode}
        onInsertImage={onOpenImageDialog}
        onTextFormat={onTextFormat}
        onTextAlign={onTextAlign}
        onInsertPhone={onInsertPhone}
        onInsertMap={onInsertMap}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      <EditorContent
        content={content}
        editMode={editMode}
        formattedPreview={formattedPreview}
        onContentChange={onContentChange}
        onSelect={onTextSelect}
        images={images}
        onImageDelete={onImageDelete}
      />
    </>
  );
};
