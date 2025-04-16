
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

  const handleInsertPhone = (phoneNumber?: string, label?: string) => {
    const phoneNum = phoneNumber || window.prompt("Inserisci il numero di telefono (formato: +39 123 456 7890):");
    if (!phoneNum) return;
    
    const displayLabel = label || window.prompt("Inserisci l'etichetta per il numero di telefono:", phoneNum) || phoneNum;
    
    const formattedPhone = phoneNum.replace(/\s+/g, '');
    insertAtCursor(`[PHONE:${formattedPhone}:${displayLabel}]`);
    
    toast.success("Numero di telefono aggiunto con successo");
  };

  const handleInsertMap = (mapUrl?: string, label?: string) => {
    const url = mapUrl || window.prompt("Inserisci l'URL di Google Maps:");
    if (!url) return;
    
    const displayLabel = label || window.prompt("Inserisci l'etichetta per la posizione:", "Visualizza su Google Maps") || "Visualizza su Google Maps";
    
    insertAtCursor(`[MAP:${url}:${displayLabel}]`);
    
    toast.success("Link a Google Maps aggiunto con successo");
  };

  const handleInsertImage = (imageDetail: ImageDetail) => {
    if (cursorPosition === null) return;
    
    const imageMarkup = JSON.stringify({
      type: "image",
      url: imageDetail.url,
      position: imageDetail.position,
      caption: imageDetail.caption || "",
      width: imageDetail.width || "50%"
    });
    
    const newContent = 
      content.substring(0, cursorPosition) + 
      "\n\n" + imageMarkup + "\n\n" + 
      content.substring(cursorPosition);
    
    onChange(newContent);
    updateHistory(newContent);
    toast.success("Immagine aggiunta con successo");
  };

  // Update history when content changes
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
