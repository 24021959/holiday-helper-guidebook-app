
import React from 'react';
import { HistoryButtons } from './components/HistoryButtons';
import { FormatButtons } from './components/FormatButtons';
import { AlignmentButtons } from './components/AlignmentButtons';
import { InsertButtons } from './components/InsertButtons';
import { ViewButtons } from './components/ViewButtons';

interface EditorToolbarProps {
  historyIndex: number;
  editHistory: string[];
  selectedText: { start: number; end: number; text: string } | null;
  editMode: 'visual' | 'preview';
  onUndo: () => void;
  onRedo: () => void;
  onTextFormat: (format: string) => void;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onOpenImageDialog: () => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
  onToggleEditMode: () => void;
  onToggleFullscreen: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  historyIndex,
  editHistory,
  selectedText,
  editMode,
  onUndo,
  onRedo,
  onTextFormat,
  onTextAlign,
  onOpenImageDialog,
  onInsertPhone,
  onInsertMap,
  onToggleEditMode,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md mb-4 sticky top-0 z-10">
      <HistoryButtons
        historyIndex={historyIndex}
        editHistory={editHistory}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      
      <FormatButtons
        selectedText={selectedText}
        onTextFormat={onTextFormat}
      />
      
      <AlignmentButtons
        selectedText={selectedText}
        onTextAlign={onTextAlign}
      />
      
      <InsertButtons
        onOpenImageDialog={onOpenImageDialog}
        onInsertPhone={onInsertPhone}
        onInsertMap={onInsertMap}
      />
      
      <div className="ml-auto">
        <ViewButtons
          editMode={editMode}
          onToggleEditMode={onToggleEditMode}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
    </div>
  );
};
