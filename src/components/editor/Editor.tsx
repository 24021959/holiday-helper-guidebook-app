
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EditorToolbar } from './EditorToolbar';
import { EditorImageDialog } from './EditorImageDialog';
import { useEditorState } from '@/hooks/editor/useEditorState';
import { useTextFormatting } from '@/hooks/editor/useTextFormatting';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const {
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
  } = useEditorState(value, onChange);

  const { handleTextFormat, handleTextAlign } = useTextFormatting(value, updateContent);

  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
    setImageDialogOpen(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      onChange(editHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      onChange(editHistory[newIndex]);
    }
  };

  const handleInsertPhone = () => {
    const phoneNumber = window.prompt("Inserisci il numero di telefono:");
    if (!phoneNumber) return;
    const newValue = value + `\n[PHONE:${phoneNumber}]`;
    onChange(newValue);
  };

  const handleInsertMap = () => {
    const location = window.prompt("Inserisci l'indirizzo o le coordinate:");
    if (!location) return;
    const newValue = value + `\n[MAP:${location}]`;
    onChange(newValue);
  };

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

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-white">
      <EditorToolbar
        expanded={expanded}
        previewMode={previewMode}
        selectedText={selectedText}
        historyIndex={historyIndex}
        editHistory={editHistory}
        onToggleExpand={toggleExpanded}
        onTogglePreview={togglePreviewMode}
        onInsertImage={handleOpenImageDialog}
        onTextFormat={handleTextFormat}
        onTextAlign={handleTextAlign}
        onInsertPhone={handleInsertPhone}
        onInsertMap={handleInsertMap}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div className="flex-1 overflow-hidden">
        {previewMode ? (
          <div 
            className="w-full h-full p-4 overflow-auto prose prose-sm max-w-none bg-gray-50"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleTextareaSelect}
            className="w-full h-full min-h-[500px] resize-none focus-visible:ring-0 border-0 rounded-none"
            placeholder="Scrivi il contenuto della pagina qui..."
          />
        )}
      </div>

      <EditorImageDialog 
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsertImage={async (imageUrl, imagePosition, imageCaption, file) => {
          try {
            // Insert image at cursor position or at the end
            const pos = cursorPosition ?? value.length;
            const imageMarkup = `\n[IMAGE:${imageUrl}:${imagePosition}:${imageCaption}]\n`;
            const newContent = 
              value.substring(0, pos) + 
              imageMarkup + 
              value.substring(pos);
            
            onChange(newContent);
            updateHistory(newContent);
            toast.success("Immagine inserita con successo");
          } catch (error) {
            console.error("Error inserting image:", error);
            toast.error("Errore nell'inserimento dell'immagine");
          }
        }}
      />
    </div>
  );
};
