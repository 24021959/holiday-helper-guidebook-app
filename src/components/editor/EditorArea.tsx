
import React, { useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorAreaProps {
  content: string;
  editMode: 'visual' | 'preview';
  formattedPreview: string;
  onContentChange: (content: string) => void;
  onSelect: () => void;
  className?: string;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  editMode,
  formattedPreview,
  onContentChange,
  onSelect,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // CRITICAL: Add this effect to force disable translations
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setAttribute('data-no-translation', 'true');
    }
    if (previewRef.current) {
      previewRef.current.setAttribute('data-no-translation', 'true');
    }
    if (textareaRef.current) {
      textareaRef.current.setAttribute('data-no-translation', 'true');
    }
    
    // Also set the parent elements
    const parent = editorRef.current?.parentElement;
    if (parent) {
      parent.setAttribute('data-no-translation', 'true');
      parent.setAttribute('data-editor', 'true');
    }
    
    return () => {
      if (parent) {
        parent.removeAttribute('data-editor');
      }
    };
  }, []);

  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className}`} 
      data-no-translation="true"
      data-editor="true"
    >
      {editMode === 'visual' ? (
        <div 
          ref={editorRef} 
          className="relative min-h-[500px] bg-white p-4" 
          data-no-translation="true"
          data-editor="true"
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onSelect={onSelect}
            onClick={onSelect}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0"
            placeholder="Inizia a scrivere qui..."
            data-no-translation="true"
            data-editor="true"
          />
        </div>
      ) : (
        <div 
          ref={previewRef}
          className="min-h-[500px] p-6 bg-white overflow-auto text-gray-800 prose max-w-none prose-headings:my-4 prose-p:my-2"
          dangerouslySetInnerHTML={{ __html: formattedPreview }}
          data-no-translation="true"
          data-editor="true"
        />
      )}
    </div>
  );
};
