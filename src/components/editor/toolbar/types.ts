
export interface FormatButtonsProps {
  selectedText: { start: number; end: number; text: string; } | null;
  onTextFormat: (format: string, selectedText: { start: number; end: number; text: string; }) => void;
}

export interface AlignmentButtonsProps {
  selectedText: { start: number; end: number; text: string; } | null;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify', selectedText: { start: number; end: number; text: string; }) => void;
}

export interface InsertButtonsProps {
  onOpenImageDialog: () => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
}

export interface ViewButtonsProps {
  editMode: 'visual' | 'preview';
  onToggleEditMode: () => void;
  onToggleFullscreen: () => void;
}

export interface HistoryButtonsProps {
  historyIndex: number;
  editHistory: string[];
  onUndo: () => void;
  onRedo: () => void;
}
