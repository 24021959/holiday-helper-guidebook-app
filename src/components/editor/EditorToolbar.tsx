
import React from 'react';
import { FormatButtons } from './toolbar/EditorToolbarButtons';
import { AlignmentButtons } from './toolbar/EditorToolbarButtons';
import { InsertButtons } from './toolbar/EditorToolbarButtons';
import { ViewButtons } from './toolbar/EditorToolbarButtons';
import { HistoryButtons } from './toolbar/EditorToolbarButtons';

interface EditorToolbarProps {
  expanded: boolean;
  previewMode: boolean;
  selectedText: { start: number; end: number; text: string } | null;
  historyIndex: number;
  editHistory: string[];
  onToggleExpand: () => void;
  onTogglePreview: () => void;
  onInsertImage: () => void;
  onTextFormat: (format: string) => void;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  expanded,
  previewMode,
  selectedText,
  historyIndex,
  editHistory,
  onToggleExpand,
  onTogglePreview,
  onInsertImage,
  onTextFormat,
  onTextAlign,
  onInsertPhone,
  onInsertMap,
  onUndo,
  onRedo
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <FormatButtons
          selectedText={selectedText}
          onTextFormat={onTextFormat}
        />
        <div className="h-6 border-r border-gray-200" />
        
        <AlignmentButtons
          selectedText={selectedText}
          onTextAlign={onTextAlign}
        />
        <div className="h-6 border-r border-gray-200" />
        
        <InsertButtons
          onOpenImageDialog={onInsertImage}
          onInsertPhone={onInsertPhone}
          onInsertMap={onInsertMap}
        />
        <div className="h-6 border-r border-gray-200" />
        
        <HistoryButtons
          historyIndex={historyIndex}
          editHistory={editHistory}
          onUndo={onUndo}
          onRedo={onRedo}
        />
        <div className="h-6 border-r border-gray-200" />
        
        <ViewButtons
          editMode={previewMode ? 'preview' : 'visual'}
          onToggleEditMode={onTogglePreview}
          onToggleFullscreen={onToggleExpand}
        />
      </div>
    </div>
  );
};
