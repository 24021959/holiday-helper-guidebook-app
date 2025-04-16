
import { LucideIcon } from 'lucide-react';

export interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface ToolbarGroupProps {
  children: React.ReactNode;
  label?: string;
}

export interface FormatButtonsProps {
  selectedText: { start: number; end: number; text: string } | null;
  onTextFormat: (format: string) => void;
}

export interface AlignmentButtonsProps {
  selectedText: { start: number; end: number; text: string } | null;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
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
