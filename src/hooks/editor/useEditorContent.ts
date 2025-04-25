import { useState } from 'react';
import { toast } from "sonner";
import { ImageDetail } from '@/types/image.types';

export const useEditorContent = (content: string, onChange: (content: string) => void) => {
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string; } | null>(null);
  const [editHistory, setEditHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(editHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(editHistory[newIndex]);
    }
  };

  const handleTextFormat = (format: string) => {
    if (!selectedText) return;
    
    const { start, end, text } = selectedText;
    let formattedText = text;
    
    switch (format) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `*${text}*`;
        break;
      case 'underline':
        formattedText = `__${text}__`;
        break;
      case 'h1':
        formattedText = `# ${text}`;
        break;
      case 'h2':
        formattedText = `## ${text}`;
        break;
      case 'bullet':
        formattedText = text.split('\n').map(line => `- ${line}`).join('\n');
        break;
      default:
        return;
    }
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    onChange(newContent);
    updateHistory(newContent);
  };

  const handleTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!selectedText) return;
    
    const { start, end, text } = selectedText;
    const alignedText = `[ALIGN:${alignment}]${text}[/ALIGN]`;
    
    const newContent = 
      content.substring(0, start) + 
      alignedText + 
      content.substring(end);
    
    onChange(newContent);
    updateHistory(newContent);
  };

  const insertAtCursor = (text: string) => {
    if (cursorPosition === null) return;
    
    const newContent = 
      content.substring(0, cursorPosition) + 
      text + 
      content.substring(cursorPosition);
    
    onChange(newContent);
    updateHistory(newContent);
  };

  const handleInsertPhone = (phoneNumber: string, label?: string) => {
    if (!phoneNumber) return;
    
    const displayLabel = label || phoneNumber;
    
    const formattedPhone = phoneNumber.replace(/\s+/g, '');
    insertAtCursor(`[PHONE:${formattedPhone}:${displayLabel}]`);
    
    toast.success("Numero di telefono aggiunto con successo");
  };

  const handleInsertMap = (mapUrl: string, label?: string) => {
    if (!mapUrl) return;
    
    const displayLabel = label || "Visualizza su Google Maps";
    
    insertAtCursor(`[MAP:${mapUrl}:${displayLabel}]`);
    
    toast.success("Link a Google Maps aggiunto con successo");
  };

  const handleInsertImage = (imageDetail: ImageDetail) => {
    if (cursorPosition === null) return;
    
    const imageData = JSON.stringify({
      type: "image",
      url: imageDetail.url,
      position: imageDetail.position,
      width: imageDetail.width,
      caption: imageDetail.caption || ""
    });
    
    const newContent = 
      content.substring(0, cursorPosition) + 
      "\n" + imageData + "\n" + 
      content.substring(cursorPosition);
    
    onChange(newContent);
    updateHistory(newContent);
    toast.success("Immagine aggiunta con successo");
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
  };
};
