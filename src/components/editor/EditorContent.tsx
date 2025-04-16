
import React, { useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorContentProps {
  content: string;
  editMode: 'visual' | 'preview';
  formattedPreview: string;
  onContentChange: (content: string) => void;
  onSelect: () => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  content,
  editMode,
  formattedPreview,
  onContentChange,
  onSelect,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border rounded-lg overflow-hidden">
      {editMode === 'visual' ? (
        <div className="relative min-h-[500px] bg-white p-4">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onSelect={onSelect}
            onClick={onSelect}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0"
            placeholder="Inizia a scrivere qui..."
          />
        </div>
      ) : (
        <div 
          ref={previewRef}
          className="min-h-[500px] p-6 bg-white overflow-auto text-gray-800 prose max-w-none prose-headings:my-4 prose-p:my-2"
          dangerouslySetInnerHTML={{ __html: formattedPreview }}
        ></div>
      )}
    </div>
  );
};
