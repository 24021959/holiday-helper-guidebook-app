import React, { useState } from "react";
import { Eye, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";
import { ImageItem } from "./PageMultiImageSection";
import PageFullscreenPreview from "./PageFullscreenPreview";

interface PagePreviewProps {
  content: string;
  title: string;
  images?: ImageItem[];
}

const PagePreview: React.FC<PagePreviewProps> = ({ content, title, images = [] }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderContent = () => {
    let processedContent = content;
    
    // Process Google Maps links
    const mapsRegex = /\[📍 (.*?)\]\((https:\/\/(?:maps\.google\.com|goo\.gl\/maps).*?)\)/g;
    processedContent = processedContent.replace(mapsRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="map-link">📍 $1</a>');
    
    // Process phone links
    const phoneRegex = /\[📞 (.*?)\]\(tel:(.*?)\)/g;
    processedContent = processedContent.replace(phoneRegex, '<a href="tel:$2" class="phone-link">📞 $1</a>');
    
    // Process regular links
    const linkRegex = /\[(.*?)\]\(((?!tel:|maps\.google|goo\.gl).*?)\)/g;
    processedContent = processedContent.replace(linkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Process images
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    processedContent = processedContent.replace(imageRegex, '<div class="editor-preview-image-center"><img src="$2" alt="$1" /></div>');
    
    // Split by paragraphs and keep empty lines
    const paragraphs = processedContent.split('\n\n');
    
    return (
      <div>
        {paragraphs.map((paragraph, index) => {
          if (!paragraph.trim()) return <div key={index} className="mb-4"></div>;
          
          if (paragraph.startsWith('<div class="editor-preview-image')) {
            return <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />;
          }
          
          return (
            <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph }} />
          );
        })}
        
        {images && images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image, index) => {
              if (image.contentImage) return null;
              
              return (
                <div key={`gallery-${index}`} className="relative">
                  <img 
                    src={image.url} 
                    alt={image.caption || "Immagine"} 
                    className="w-full h-auto rounded-md"
                  />
                  {image.caption && (
                    <div className="text-sm text-gray-600 mt-1">
                      <TranslatedText text={image.caption} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const previewContent = (
    <div className="editor-preview">
      <h2 className="text-2xl font-bold mb-6">
        <TranslatedText text={title} />
      </h2>
      {renderContent()}
    </div>
  );

  const fullscreenContent = (
    <div className="preview-fullscreen">
      <div className="preview-fullscreen-content">
        <h1 className="text-3xl font-bold mb-8">
          <TranslatedText text={title} />
        </h1>
        {renderContent()}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          <TranslatedText text="Anteprima" />
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-2"
        >
          <Maximize2 className="h-4 w-4" />
          <TranslatedText text="Anteprima a schermo intero" />
        </Button>
      </div>
      
      {previewContent}
      
      <PageFullscreenPreview
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        content={fullscreenContent}
        title={title}
      />
    </div>
  );
};

export default PagePreview;
