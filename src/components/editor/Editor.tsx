
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EditorToolbar } from './EditorToolbar';
import { EditorImageDialog } from './EditorImageDialog';
import { useEditorContent } from '@/hooks/editor/useEditorContent';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const { 
    cursorPosition, 
    setCursorPosition,
    parseContent,
    uploadImageToSupabase,
    insertImageAtCursor
  } = useEditorContent();

  const toggleExpanded = () => setExpanded(!expanded);
  const togglePreviewMode = () => setPreviewMode(!previewMode);

  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
    setImageDialogOpen(true);
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
