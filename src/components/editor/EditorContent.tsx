
import React, { useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { ImageDetail } from '@/types/image.types';

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

  const renderInlineImages = () => {
    let htmlContent = content;
    
    // Replace image placeholders with actual images
    images.forEach((image, index) => {
      const positionClass = 
        image.position === "left" ? "float-left mr-4" : 
        image.position === "right" ? "float-right ml-4" : 
        image.position === "full" ? "w-full block" : 
        "mx-auto block";
      
      const placeholder = `[IMAGE_${index}]`;
      const imageHtml = `
        <figure class="${positionClass}" style="width: ${image.width}; margin-bottom: 1rem;">
          <img 
            src="${image.url}" 
            alt="${image.caption || `Image ${index+1}`}" 
            class="w-full h-auto rounded-md" 
            data-image-index="${index}"
          />
          ${image.caption ? `<figcaption class="text-sm text-gray-500 mt-1">${image.caption}</figcaption>` : ''}
        </figure>
      `;
      
      htmlContent = htmlContent.replace(placeholder, imageHtml);
    });

    return htmlContent;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {editMode === 'visual' ? (
        <div className="relative min-h-[500px] bg-white p-4">
          <div className="absolute inset-0 pointer-events-none prose max-w-none p-4" dangerouslySetInnerHTML={{ __html: renderInlineImages() }} />
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onSelect={onSelect}
            onClick={onSelect}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 bg-transparent relative z-10"
            placeholder="Inizia a scrivere qui..."
          />
        </div>
      ) : (
        <div 
          ref={previewRef}
          className="min-h-[500px] p-6 bg-white overflow-auto text-gray-800 prose max-w-none prose-headings:my-4 prose-p:my-2"
          dangerouslySetInnerHTML={{ __html: formattedPreview }}
        />
      )}
    </div>
  );
};

