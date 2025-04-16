import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EditorToolbar } from './EditorToolbar';
import { EditorImageDialog } from './EditorImageDialog';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const toggleExpanded = () => setExpanded(!expanded);
  const togglePreviewMode = () => setPreviewMode(!previewMode);

  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
    setImageDialogOpen(true);
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
      '$2</a>');
    
    // Convert location/maps
    formatted = formatted.replace(/\[MAP:(.*?):(.*?)\]/g, 
      '<a href="$1" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">' +
      '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' +
      '$2</a>');
    
    // Convert headings
    formatted = formatted.replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-bold my-3">$1</h2>');
    formatted = formatted.replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-2xl font-bold my-4">$1</h1>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    // This would be implemented with actual Supabase upload logic
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file));
      }, 500);
    });
  };

  const insertImageAtCursor = (content: string, imageMarkup: string, position: number | null): string => {
    if (position === null) return content;
    
    return content.substring(0, position) + 
      "\n\n" + imageMarkup + "\n\n" + 
      content.substring(position);
  };

  const handleInsertImage = async (imageUrl: string, imagePosition: string, imageCaption: string, file?: File) => {
    try {
      let finalImageUrl = imageUrl;
      
      // If we have a file, upload it first
      if (file) {
        finalImageUrl = await uploadImageToSupabase(file);
      }
      
      // Create image markdown with JSON metadata for rendering
      const imageMarkup = JSON.stringify({
        type: "image",
        url: finalImageUrl,
        position: imagePosition,
        caption: imageCaption || ""
      });
      
      // Insert at cursor position
      const newContent = insertImageAtCursor(value, imageMarkup, cursorPosition);
      onChange(newContent);
      
      toast.success("Immagine inserita con successo");
    } catch (error) {
      console.error("Error inserting image:", error);
      toast.error("Errore durante l'inserimento dell'immagine");
    }
  };

  return (
    <div className={`border rounded-md ${expanded ? 'fixed inset-5 z-50 bg-white p-4 overflow-auto' : 'p-2 min-h-[300px]'}`}>
      <EditorToolbar
        expanded={expanded}
        previewMode={previewMode}
        onToggleExpand={toggleExpanded}
        onTogglePreview={togglePreviewMode}
        onInsertImage={handleOpenImageDialog}
      />

      {previewMode ? (
        <div 
          className="min-h-[300px] w-full p-4 overflow-auto prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: parseContent(value) }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-[300px] w-full resize-none focus-visible:ring-0 border-none p-4 ${expanded ? 'h-[calc(100vh-8rem)]' : ''}`}
          placeholder="Scrivi il contenuto della pagina qui..."
        />
      )}

      <EditorImageDialog 
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsertImage={handleInsertImage}
      />
    </div>
  );
};
