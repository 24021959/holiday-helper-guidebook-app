
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
  onTextSelect: () => void;
  onTextFormat: (format: string) => void;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  images: ImageDetail[];
  onImageDelete?: (index: number) => void;
  forcePreviewOnly?: boolean;
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
  onTextSelect,
  onTextFormat,
  onTextAlign,
  onInsertPhone,
  onInsertMap,
  onUndo,
  onRedo,
  images,
  onImageDelete,
  forcePreviewOnly = false
}) => {
  return (
    <>
      {!forcePreviewOnly && (
        <EditorToolbar
          expanded={isFullscreen}
          previewMode={editMode === 'preview'}
          selectedText={selectedText}
          historyIndex={historyIndex}
          editHistory={editHistory}
          onToggleExpand={onToggleFullscreen}
          onTogglePreview={onToggleEditMode}
          onTextFormat={onTextFormat}
          onTextAlign={onTextAlign}
          onInsertPhone={onInsertPhone}
          onInsertMap={onInsertMap}
          onUndo={onUndo}
          onRedo={onRedo}
        />
      )}

      <EditorContent
        content={content}
        editMode={editMode}
        formattedPreview={formattedPreview}
        onContentChange={onContentChange}
        onSelect={onTextSelect}
        images={images}
        onImageDelete={onImageDelete}
        forcePreviewOnly={forcePreviewOnly}
      />
    </>
  );
};
