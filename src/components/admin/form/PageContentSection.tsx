
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import ImageInsertionDialog from "./ImageInsertionDialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Info, Rows3, PanelRight, PanelLeft } from "lucide-react";
import { ImageItem } from "./PageMultiImageSection";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const handleFormatClick = (format: 'paragraph' | 'left' | 'right' | 'center') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const content = getValues(name) as string;
    
    let formattedText = '';
    
    switch (format) {
      case 'paragraph':
        // Split selected text by line breaks and wrap each paragraph with an extra line break
        formattedText = selectedText
          .split('.')
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .join('.\n\n');
        
        if (!formattedText.endsWith('.')) formattedText += '.';
        break;
      
      case 'left':
      case 'right':
      case 'center':
        // Add special comment for future image alignment
        formattedText = `<!-- FORMAT:${format.toUpperCase()} -->\n${selectedText}`;
        break;
    }
    
    // Insert the formatted text
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setValue(name, newContent, { shouldDirty: true });
    
    // Set cursor position after the formatted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
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
            <div className="flex items-center justify-between">
              <FormLabel>{label}</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4 text-sm">
                    <p>Suggerimenti per la leggibilità:</p>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li>Utilizza paragrafi brevi (2-3 frasi)</li>
                      <li>Inserisci uno spazio vuoto tra i paragrafi</li>
                      <li>Usa elenchi puntati per informazioni importanti</li>
                      <li>Evidenzia le parole chiave in grassetto</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('paragraph')}
                        className="text-xs"
                      >
                        <Rows3 className="h-4 w-4 mr-1" />
                        Separa in paragrafi
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Divide il testo selezionato in paragrafi dopo ogni punto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('left')}
                        className="text-xs"
                      >
                        <PanelLeft className="h-4 w-4 mr-1" />
                        Allinea a sinistra
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Allinea il testo selezionato a sinistra</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('center')}
                        className="text-xs"
                      >
                        <Rows3 className="h-4 w-4 mr-1" />
                        Centra
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Centra il testo selezionato</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('right')}
                        className="text-xs"
                      >
                        <PanelRight className="h-4 w-4 mr-1" />
                        Allinea a destra
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Allinea il testo selezionato a destra</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <FormControl>
                <Textarea
                  {...field}
                  ref={textareaRef}
                  className="min-h-[350px] font-medium leading-relaxed p-4"
                  style={{ lineHeight: "1.8" }}
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
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={image.url} 
                      alt={`Immagine ${idx + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs px-2 py-1 rounded-bl">
                    {image.position === "left" ? "SX" : 
                     image.position === "right" ? "DX" : 
                     image.position === "center" ? "Centro" : "Intera"}
                  </div>
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
