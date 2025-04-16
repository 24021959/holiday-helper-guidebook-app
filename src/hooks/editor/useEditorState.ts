
import { useState } from 'react';
import { ImageDetail } from '@/types/image.types';

export const useEditorState = (
  initialValue: string, 
  onChange: (value: string) => void
) => {
  const [expanded, setExpanded] = useState(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string; } | null>(null);
  const [editHistory, setEditHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const toggleExpanded = () => setExpanded(!expanded);
  const togglePreviewMode = () => setPreviewMode(!previewMode);

  const updateContent = (newContent: string) => {
    onChange(newContent);
    updateHistory(newContent);
  };

  const updateHistory = (newContent: string) => {
    if (newContent !== editHistory[historyIndex]) {
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  return {
    expanded,
    previewMode,
    imageDialogOpen,
    cursorPosition,
    selectedText,
    historyIndex,
    editHistory,
    setImageDialogOpen,
    setCursorPosition,
    setSelectedText,
    toggleExpanded,
    togglePreviewMode,
    updateContent,
    updateHistory
  };
};
