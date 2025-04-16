import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EditorToolbar } from './EditorToolbar';
import { EditorImageDialog } from './EditorImageDialog';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState<number | null>(null);
  const [selectedText, setSelectedText] = React.useState<{ start: number; end: number; text: string; } | null>(null);
  const [editHistory, setEditHistory] = React.useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  const toggleExpanded = () => setExpanded(!expanded);
  const togglePreviewMode = () => setPreviewMode(!previewMode);

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
      value.substring(0, start) + 
      formattedText + 
      value.substring(end);
    
    onChange(newContent);
    updateHistory(newContent);
  };

  const handleTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!selectedText) return;
    
    const { start, end, text } = selectedText;
    const alignedText = `[ALIGN:${alignment}]${text}[/ALIGN]`;
    
    const newContent = 
      value.substring(0, start) + 
      alignedText + 
      value.substring(end);
    
    onChange(newContent);
    updateHistory(newContent);
  };

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

  const parseContent = (content: string): string => {
    let formatted = content || '';
    
    // Convert markdown-like formatting to HTML
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Convert phone numbers
    formatted = formatted.replace(/\[PHONE:(.*?):(.*?)\]/g, 
      '<a href="tel:$1" class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200">' +
      '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>' +
      '$1</a>');
    
    // Convert location/maps
    formatted = formatted.replace(/\[MAP:(.*?):(.*?)\]/g, 
      '<a href="$1" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">' +
      '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' +
      '$1</a>');
    
    // Convert headings
    formatted = formatted.replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-bold my-3">$1</h2>');
    formatted = formatted.replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-2xl font-bold my-4">$1</h1>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
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

  const updateHistory = (newContent: string) => {
    if (newContent !== editHistory[historyIndex]) {
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
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
            dangerouslySetInnerHTML={{ __html: parseContent(value) }}
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
        onInsertImage={(url, position, caption, file) => {
          // Implement image insertion logic here
          console.log("Inserting image:", url, position, caption, file);
          toast.success("Immagine inserita con successo");
        }}
      />
    </div>
  );
};
