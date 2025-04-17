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

  // Clean content for editor display - remove HTML tags and replace JSON
  const cleanedContent = React.useMemo(() => {
    let cleaned = content;
    
    // Remove HTML tags
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Replace image JSON with simple placeholders
    const regex = /\{\"type\":\"image\"[\s\S]*?\}/g;
    cleaned = cleaned.replace(regex, '[Immagine]');
    
    // Remove any <!-- IMAGES --> comments
    cleaned = cleaned.replace(/<!-- IMAGES -->/g, '');
    
    // Clean up multiple consecutive line breaks
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned;
  }, [content]);

  // If forcePreviewOnly is true, we always show the preview
  const displayMode = forcePreviewOnly ? 'preview' : editMode;

  // Helper function to preserve original HTML and JSON when saving changes
  const preserveFormattingOnChange = (newText: string) => {
    // Keep original HTML tags
    let updatedContent = content;
    
    // Extract all HTML tags and JSON from original content to preserve them
    const htmlTags: string[] = [];
    const imageTags: string[] = [];
    
    // Extract HTML tags
    const htmlRegex = /<[^>]+>/g;
    let htmlMatch;
    while ((htmlMatch = htmlRegex.exec(content)) !== null) {
      htmlTags.push(htmlMatch[0]);
    }
    
    // Extract image JSON objects
    const jsonRegex = /\{\"type\":\"image\"[\s\S]*?\}/g;
    let jsonMatch;
    while ((jsonMatch = jsonRegex.exec(content)) !== null) {
      imageTags.push(jsonMatch[0]);
    }
    
    // Replace text content while preserving structure
    // For simplicity, we'll just use the new text and keep the image JSON sections
    updatedContent = newText;
    
    // Add back the image JSON if it was present
    if (imageTags.length > 0) {
      updatedContent += '\n\n<!-- IMAGES -->\n';
      imageTags.forEach(tag => {
        updatedContent += tag + '\n';
      });
    }
    
    onContentChange(updatedContent);
  };

  return (
    <div className="border rounded-lg overflow-hidden" data-no-translation="true">
      {displayMode === 'visual' ? (
        <div className="relative min-h-[500px] bg-white p-4" data-no-translation="true">
          <Textarea
            ref={textareaRef}
            value={cleanedContent}
            onChange={(e) => preserveFormattingOnChange(e.target.value)}
            onSelect={onSelect}
            onClick={onSelect}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 bg-transparent relative z-10 font-base leading-relaxed"
            placeholder="Inizia a scrivere qui..."
            data-no-translation="true"
            style={{ lineHeight: '1.8' }}
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
