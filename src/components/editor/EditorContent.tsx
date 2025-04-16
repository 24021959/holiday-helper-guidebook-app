
import React, { useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { ImageDetail } from '@/types/image.types';
import TranslatedText from '@/components/TranslatedText';

interface EditorContentProps {
  content: string;
  editMode: 'visual' | 'preview';
  formattedPreview: string;
  onContentChange: (content: string) => void;
  onSelect: () => void;
  images?: ImageDetail[];
}

export const EditorContent: React.FC<EditorContentProps> = ({
  content,
  editMode,
  formattedPreview,
  onContentChange,
  onSelect,
  images = []
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border rounded-lg overflow-hidden" data-no-translation="true">
      {editMode === 'visual' ? (
        <div className="relative min-h-[500px] bg-white p-4" data-no-translation="true">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onSelect={onSelect}
            onClick={onSelect}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 bg-transparent relative z-10"
            placeholder="Inizia a scrivere qui..."
            data-no-translation="true"
          />
        </div>
      ) : (
        <div 
          ref={previewRef}
          className="min-h-[500px] p-6 bg-white overflow-auto text-gray-800 prose max-w-none prose-headings:my-4 prose-p:my-2"
          dangerouslySetInnerHTML={{ __html: formattedPreview }}
          data-no-translation="true"
        />
      )}
    </div>
  );
};
