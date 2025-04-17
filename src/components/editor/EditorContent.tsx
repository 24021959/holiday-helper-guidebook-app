
import React, { useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { ImageDetail } from '@/types/image.types';

interface EditorContentProps {
  content: string;
  editMode: 'visual' | 'preview';
  formattedPreview: string;
  onContentChange: (content: string) => void;
  onSelect: () => void;
  images?: ImageDetail[];
  onImageDelete?: (index: number) => void;
  forcePreviewOnly?: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  content,
  editMode,
  formattedPreview,
  onContentChange,
  onSelect,
  images = [],
  onImageDelete,
  forcePreviewOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Improved image handling - replace JSON with simple placeholders
  const processedContent = React.useMemo(() => {
    let processed = content;
    
    // Replace image JSON data with placeholders for editor
    const regex = /\{\"type\":\"image\",.*?\}/g;
    processed = processed.replace(regex, `[IMAGE PLACEHOLDER]`);
    
    return processed;
  }, [content]);

  // If forcePreviewOnly is true, we always show the preview
  const displayMode = forcePreviewOnly ? 'preview' : editMode;

  return (
    <div className="border rounded-lg overflow-hidden" data-no-translation="true">
      {displayMode === 'visual' ? (
        <div className="relative min-h-[500px] bg-white p-4" data-no-translation="true">
          <Textarea
            ref={textareaRef}
            value={processedContent}
            onChange={(e) => {
              // Preserve original image markers when saving changes
              let newContent = e.target.value;
              const originalImages = [];
              const regex = /\{\"type\":\"image\",.*?\}/g;
              let match;
              
              while ((match = regex.exec(content)) !== null) {
                originalImages.push(match[0]);
              }
              
              // Replace placeholders with original image data
              originalImages.forEach((imgData) => {
                newContent = newContent.replace('[IMAGE PLACEHOLDER]', imgData);
              });
              
              onContentChange(newContent);
            }}
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
