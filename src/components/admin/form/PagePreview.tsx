
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageItem {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  type: "image";
}

interface PagePreviewProps {
  title: string;
  content: string;
  images: ImageItem[];
  thumbnailUrl?: string | null;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  title,
  content,
  images,
  thumbnailUrl
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const renderContent = () => {
    let processedContent = content;
    const contentSections = [];
    
    // Process text paragraphs
    const paragraphs = processedContent.split("\n").filter(p => p.trim() !== "");
    paragraphs.forEach((paragraph, index) => {
      contentSections.push(
        <p key={`p-${index}`} className="mb-4">
          {paragraph}
        </p>
      );
    });
    
    // Add images at their respective positions
    images.forEach((image, index) => {
      const imageClass = 
        image.position === "left" ? "editor-preview-image-left" :
        image.position === "right" ? "editor-preview-image-right" :
        image.position === "center" ? "editor-preview-image-center" :
        "editor-preview-image-full";
      
      contentSections.push(
        <figure key={`img-${index}`} className={imageClass}>
          <img 
            src={image.url} 
            alt={image.caption || `Immagine ${index + 1}`}
            className="rounded-md shadow-sm"
          />
          {image.caption && (
            <figcaption className="text-sm text-gray-500 text-center mt-1">
              {image.caption}
            </figcaption>
          )}
        </figure>
      );
    });
    
    return contentSections;
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center"
      >
        <Eye className="h-4 w-4 mr-2" />
        Anteprima pagina
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{title}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {thumbnailUrl && (
              <div className="mb-6">
                <AspectRatio ratio={16/9} className="bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={thumbnailUrl} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            )}
            
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold mb-6">{title}</h1>
              <div className="editor-preview">
                {renderContent()}
                <div className="clear-both"></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PagePreview;
