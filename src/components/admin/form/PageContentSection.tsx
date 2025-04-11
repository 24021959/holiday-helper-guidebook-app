
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import ImageInsertionDialog from "./ImageInsertionDialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Info, Rows3, PanelRight, PanelLeft, AlignCenter, MapPin, Phone } from "lucide-react";
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
  const { control, setValue, getValues, watch } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [clickPosition, setClickPosition] = useState<number | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  
  // Watch for content changes to update preview
  const contentValue = watch(name);
  
  React.useEffect(() => {
    setPreviewContent(formatContentForPreview(contentValue || ""));
  }, [contentValue]);

  const formatContentForPreview = (content: string): string => {
    if (!content) return "";
    
    let formattedContent = content;
    
    // Convert alignment tags to inline styles
    formattedContent = formattedContent.replace(
      /<!-- FORMAT:LEFT -->\n(.*?)(?=<!-- FORMAT:|$)/gs, 
      '<div style="text-align: left;">$1</div>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- FORMAT:CENTER -->\n(.*?)(?=<!-- FORMAT:|$)/gs, 
      '<div style="text-align: center;">$1</div>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- FORMAT:RIGHT -->\n(.*?)(?=<!-- FORMAT:|$)/gs, 
      '<div style="text-align: right;">$1</div>'
    );
    
    // Convert newlines to <br> tags
    formattedContent = formattedContent.replace(/\n\n/g, '<br><br>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };

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

  const handleInsertMapClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowMapDialog(true);
    }
  };

  const handleInsertPhoneClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowPhoneDialog(true);
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
        formattedText = `<!-- FORMAT:${format.toUpperCase()} -->\n${selectedText}\n`;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setValue(name, newContent, { shouldDirty: true });
    
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
        let imageName = "Immagine";
        if (imageUrl.startsWith('data:image')) {
          imageName = "Immagine caricata";
        } else {
          const urlParts = imageUrl.split('/');
          if (urlParts.length > 0) {
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.length > 0) {
              imageName = lastPart.length > 20 ? lastPart.substring(0, 20) + "..." : lastPart;
            }
          }
        }
        
        const imageMarkup = `\n<!-- IMAGE: ${imageUrl} -->\n[Immagine: ${imageName}]\n`;
        const newContent = content.substring(0, clickPosition) + imageMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Immagine inserita correttamente:", imageName);
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

  const handleInsertMap = (mapUrl: string, placeName: string) => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        const mapMarkup = `\n<!-- MAP: ${mapUrl} -->\n[📍 ${placeName}]\n`;
        const newContent = content.substring(0, clickPosition) + mapMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Link a Google Maps inserito correttamente:", placeName);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento del link a Google Maps:", error);
    }
    setShowMapDialog(false);
  };

  const handleInsertPhone = (phoneNumber: string, label: string) => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        const formattedNumber = phoneNumber.replace(/\s+/g, '');
        const phoneMarkup = `\n<!-- PHONE: ${formattedNumber} -->\n[📞 ${label || phoneNumber}]\n`;
        const newContent = content.substring(0, clickPosition) + phoneMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Numero di telefono inserito correttamente:", phoneNumber);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento del numero di telefono:", error);
    }
    setShowPhoneDialog(false);
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
                      <li>Aggiungi link a Google Maps per le località</li>
                      <li>Inserisci numeri di telefono cliccabili</li>
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
                        <AlignCenter className="h-4 w-4 mr-1" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      className="min-h-[350px] font-medium leading-relaxed p-4 resize-none"
                      style={{ lineHeight: "1.8" }}
                    />
                  </FormControl>
                </div>
                <div>
                  <div className="border rounded-md p-4 min-h-[350px] bg-white overflow-auto">
                    <div 
                      className="prose prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: previewContent }} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">Anteprima della formattazione</p>
                </div>
              </div>
              
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

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleInsertMapClick}
                  className="flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Inserisci link Google Maps
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleInsertPhoneClick}
                  className="flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Inserisci numero di telefono
                </Button>
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

      {showMapDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Inserisci link a Google Maps</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome del luogo
                </label>
                <input 
                  type="text" 
                  id="placeName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Es. Ristorante Da Mario"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL di Google Maps
                </label>
                <input 
                  type="text" 
                  id="mapUrl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cerca il luogo su Google Maps, clicca su "Condividi" e copia il link
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowMapDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                onClick={() => {
                  const mapUrlInput = document.getElementById('mapUrl') as HTMLInputElement;
                  const placeNameInput = document.getElementById('placeName') as HTMLInputElement;
                  if (mapUrlInput && placeNameInput) {
                    handleInsertMap(mapUrlInput.value, placeNameInput.value);
                  }
                }}
              >
                Inserisci
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPhoneDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Inserisci numero di telefono</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etichetta (opzionale)
                </label>
                <input 
                  type="text" 
                  id="phoneLabel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Es. Prenotazioni"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero di telefono
                </label>
                <input 
                  type="tel" 
                  id="phoneNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowPhoneDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                onClick={() => {
                  const phoneNumberInput = document.getElementById('phoneNumber') as HTMLInputElement;
                  const phoneLabelInput = document.getElementById('phoneLabel') as HTMLInputElement;
                  if (phoneNumberInput) {
                    handleInsertPhone(phoneNumberInput.value, phoneLabelInput?.value || '');
                  }
                }}
              >
                Inserisci
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
