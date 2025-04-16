
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
  onImageDelete?: (index: number) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  content,
  editMode,
  formattedPreview,
  onContentChange,
  onSelect,
  images = [],
  onImageDelete
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse content to identify and replace image markers
  const processedContent = React.useMemo(() => {
    let processed = content;
    
    // Replace image JSON data with placeholders for editor
    const regex = /\{\"type\":\"image\",.*?\}/g;
    let match;
    let index = 0;
    
    while ((match = regex.exec(content)) !== null) {
      try {
        const imageData = JSON.parse(match[0]);
        processed = processed.replace(match[0], `[IMAGE_${index}]`);
        index++;
      } catch (e) {
        console.error("Failed to parse image data:", e);
      }
    }
    
    return processed;
  }, [content]);

  // Extract images from content for visual display
  const contentImages = React.useMemo(() => {
    const images: ImageDetail[] = [];
    const regex = /\{\"type\":\"image\",.*?\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      try {
        const imageData = JSON.parse(match[0]);
        images.push({
          url: imageData.url,
          position: imageData.position,
          width: imageData.width || "50%",
          caption: imageData.caption || ""
        });
      } catch (e) {
        console.error("Failed to parse image data:", e);
      }
    }
    
    return images;
  }, [content]);

  // Handle image deletion from the editor
  const handleImageDelete = (index: number) => {
    if (onImageDelete) {
      onImageDelete(index);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden" data-no-translation="true">
      {editMode === 'visual' ? (
        <div className="relative min-h-[500px] bg-white p-4" data-no-translation="true">
          <Textarea
            ref={textareaRef}
            value={processedContent}
            onChange={(e) => onContentChange(e.target.value)}
            onSelect={onSelect}
            onClick={onSelect}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 bg-transparent relative z-10"
            placeholder="Inizia a scrivere qui..."
            data-no-translation="true"
          />
          {/* Display images in the visual editor */}
          <div className="absolute inset-0 pointer-events-none p-4 overflow-auto" data-no-translation="true">
            {contentImages.map((image, idx) => {
              const positionClass = 
                image.position === "left" ? "float-left mr-4" : 
                image.position === "right" ? "float-right ml-4" : 
                image.position === "full" ? "w-full block" : 
                "mx-auto block";
                
              return (
                <div 
                  key={idx}
                  className="relative pointer-events-auto"
                  style={{
                    width: image.width,
                    margin: image.position === "center" ? "0 auto" : undefined,
                    float: image.position === "left" ? "left" : image.position === "right" ? "right" : undefined,
                    clear: image.position === "full" ? "both" : undefined,
                    marginBottom: "1rem",
                    marginRight: image.position === "left" ? "1rem" : undefined,
                    marginLeft: image.position === "right" ? "1rem" : undefined
                  }}
                >
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity z-20"
                    onClick={() => handleImageDelete(idx)}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </button>
                  <img 
                    src={image.url} 
                    alt={image.caption || `Image ${idx+1}`}
                    className="w-full h-auto rounded-md"
                  />
                  {image.caption && (
                    <p className="text-sm text-gray-500 mt-1">{image.caption}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div 
            className="absolute inset-0 pointer-events-none p-4 prose max-w-none overflow-hidden"
            dangerouslySetInnerHTML={{ __html: formattedPreview }}
            data-no-translation="true"
            style={{ zIndex: 5 }}
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
