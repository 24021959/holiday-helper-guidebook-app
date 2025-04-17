
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

  // CRITICAL: Aggressive disabling of translations throughout the editor
  useEffect(() => {
    // Ensure all editor elements are protected from translation
    if (editorRef.current) {
      editorRef.current.setAttribute('data-no-translation', 'true');
    }
    if (previewRef.current) {
      previewRef.current.setAttribute('data-no-translation', 'true');
    }
    if (textareaRef.current) {
      textareaRef.current.setAttribute('data-no-translation', 'true');
    }
    
    // Set attributes on parent elements
    const parent = editorRef.current?.parentElement;
    if (parent) {
      parent.setAttribute('data-no-translation', 'true');
      parent.setAttribute('data-editor', 'true');
    }
    
    // Set global flags
    document.body.setAttribute('data-no-translation', 'true');
    
    // Add attributes to all content-editable elements
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.setAttribute('data-no-translation', 'true');
    });
    
    // Add attributes to all form elements
    document.querySelectorAll('form, textarea, input').forEach(el => {
      el.setAttribute('data-no-translation', 'true');
    });
    
    return () => {
      // Keep the no-translation attribute on the body when unmounting
      // Just in case other editor components are still active
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
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 font-base leading-relaxed"
            placeholder="Inizia a scrivere qui..."
            data-no-translation="true"
            data-editor="true"
            style={{ lineHeight: '1.8' }}
          />
        </div>
      ) : (
        <div 
          ref={previewRef}
          className="min-h-[500px] p-6 bg-white overflow-auto text-gray-800 prose max-w-none prose-headings:my-4 prose-p:my-4"
          dangerouslySetInnerHTML={{ __html: formattedPreview }}
          data-no-translation="true"
          data-editor="true"
        />
      )}
    </div>
  );
};
