
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import ImageInsertionDialog from "./ImageInsertionDialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { ImageItem } from "./PageMultiImageSection";

interface PageContentSectionProps {
  name: string;
  label: string;
  pageImages?: ImageItem[];
  onInsertImage?: (imageId: number) => void;
}

export const PageContentSection: React.FC<PageContentSectionProps> = ({
  name,
  label,
  pageImages = [],
  onInsertImage
}) => {
  const { control, setValue, getValues } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [clickPosition, setClickPosition] = useState<number | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);

  const handleInsertImageClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowImageDialog(true);
    }
  };

  const handleInsertGalleryImageClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowGalleryDialog(true);
    }
  };

  const handleInsertImage = (imageUrl: string) => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        // Create a shorter preview version if it's a base64 image
        let displayUrl = imageUrl;
        if (imageUrl.startsWith('data:image')) {
          displayUrl = '[Immagine]';
        }
        
        // Insert image markup at cursor position
        const imageMarkup = `\n![${displayUrl}](${imageUrl})\n`;
        const newContent = content.substring(0, clickPosition) + imageMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Immagine inserita correttamente come markdown:", displayUrl);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento dell'immagine:", error);
    }
    setShowImageDialog(false);
  };

  const handleInsertGalleryImage = (imageId: number) => {
    try {
      if (onInsertImage) {
        onInsertImage(imageId);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento dell'immagine dalla galleria:", error);
    }
    setShowGalleryDialog(false);
  };

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2">
              <FormControl>
                <Textarea
                  {...field}
                  ref={textareaRef}
                  className="min-h-[200px]"
                />
              </FormControl>
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleInsertImageClick}
                  className="flex items-center"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Inserisci nuova immagine
                </Button>
                
                {pageImages.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleInsertGalleryImageClick}
                    className="flex items-center"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Inserisci da galleria
                  </Button>
                )}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleInsertImage}
      />

      {showGalleryDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Scegli immagine dalla galleria</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {pageImages.map((image, idx) => (
                <div 
                  key={idx} 
                  className="relative border rounded cursor-pointer hover:border-emerald-500 transition-colors"
                  onClick={() => handleInsertGalleryImage(idx)}
                >
                  <img 
                    src={image.url} 
                    alt={`Immagine ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowGalleryDialog(false)}
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
