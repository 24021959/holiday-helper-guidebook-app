
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageIcon, Maximize2, Minimize2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePosition, setImagePosition] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const toggleExpanded = () => setExpanded(!expanded);
  const togglePreviewMode = () => setPreviewMode(!previewMode);

  const handleOpenImageDialog = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
    setImageDialogOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
      // Show preview of the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `lovable-uploads/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('public').getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Errore durante il caricamento dell'immagine");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImageAtCursor = async () => {
    if (!cursorPosition && cursorPosition !== 0) return;
    
    try {
      let finalImageUrl = imageUrl;
      
      // If we have a file, upload it first
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile);
      }
      
      // Create image markdown with JSON metadata for rendering
      const imageMarkup = JSON.stringify({
        type: "image",
        url: finalImageUrl,
        position: imagePosition,
        caption: imageCaption || ""
      });
      
      // Insert at cursor position
      const newContent = 
        value.substring(0, cursorPosition) + 
        "\n\n" + imageMarkup + "\n\n" + 
        value.substring(cursorPosition);
      
      onChange(newContent);
      
      // Reset form and close dialog
      setImageFile(null);
      setImageUrl('');
      setImageCaption('');
      setImagePosition('center');
      setImageDialogOpen(false);
      
      toast.success("Immagine inserita con successo");
    } catch (error) {
      console.error("Error inserting image:", error);
      toast.error("Errore durante l'inserimento dell'immagine");
    }
  };

  // Function to parse and render the content with previews
  const parseContent = (content: string) => {
    if (!content) return '';
    
    let parsedContent = content;
    
    // Replace image JSON objects with actual image previews
    const imageRegex = /\n\n({.*?"type":"image".*?})\n\n/g;
    parsedContent = parsedContent.replace(imageRegex, (match, jsonStr) => {
      try {
        const imageData = JSON.parse(jsonStr);
        if (imageData.type === "image") {
          const positionClass = 
            imageData.position === 'left' ? 'float-left mr-4 w-1/3' :
            imageData.position === 'right' ? 'float-right ml-4 w-1/3' :
            imageData.position === 'full' ? 'w-full my-4' :
            'mx-auto my-4 w-2/3';
          
          return `
            <div class="image-preview ${positionClass}" style="margin: 1rem 0; position: relative;">
              <img src="${imageData.url}" alt="${imageData.caption || 'Image'}" style="max-width: 100%; border-radius: 4px;" />
              ${imageData.caption ? `<div style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">${imageData.caption}</div>` : ''}
            </div>
          `;
        }
      } catch (e) {
        console.error("Error parsing image data", e);
      }
      return match;
    });
    
    // Format paragraphs
    parsedContent = parsedContent.replace(/\n\n/g, '</p><p>');
    parsedContent = `<p>${parsedContent}</p>`;
    
    return parsedContent;
  };

  return (
    <div className={`border rounded-md ${expanded ? 'fixed inset-5 z-50 bg-white p-4 overflow-auto' : 'p-2 min-h-[300px]'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={handleOpenImageDialog}
            className="text-gray-500 hover:text-gray-700"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Inserisci Immagine</span>
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePreviewMode}
            className="h-8 w-8"
            title={previewMode ? "Modalità modifica" : "Modalità anteprima"}
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            className="h-8 w-8"
            title={expanded ? "Riduci editor" : "Espandi editor"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div 
          className="min-h-[300px] w-full p-4 overflow-auto prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: parseContent(value) }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-[300px] w-full resize-none focus-visible:ring-0 border-none p-4 ${expanded ? 'h-[calc(100vh-8rem)]' : ''}`}
          placeholder="Scrivi il contenuto della pagina qui..."
        />
      )}

      {/* Dialog per l'inserimento di immagini */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Inserisci Immagine</DialogTitle>
            <DialogDescription>
              Carica un'immagine o inserisci l'URL di un'immagine esistente
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="file-upload" className="text-sm font-medium">
                Carica immagine
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="border p-2 rounded-md text-sm"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="image-url" className="text-sm font-medium">
                URL Immagine (opzionale)
              </label>
              <input
                id="image-url"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="border p-2 rounded-md"
                disabled={!!imageFile}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="image-caption" className="text-sm font-medium">
                Didascalia (opzionale)
              </label>
              <input
                id="image-caption"
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Descrizione dell'immagine"
                className="border p-2 rounded-md"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Posizione</label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={imagePosition === 'left' ? 'default' : 'outline'}
                  onClick={() => setImagePosition('left')}
                  className="flex-1"
                >
                  Sinistra
                </Button>
                <Button
                  type="button"
                  variant={imagePosition === 'center' ? 'default' : 'outline'}
                  onClick={() => setImagePosition('center')}
                  className="flex-1"
                >
                  Centro
                </Button>
                <Button
                  type="button"
                  variant={imagePosition === 'right' ? 'default' : 'outline'}
                  onClick={() => setImagePosition('right')}
                  className="flex-1"
                >
                  Destra
                </Button>
                <Button
                  type="button"
                  variant={imagePosition === 'full' ? 'default' : 'outline'}
                  onClick={() => setImagePosition('full')}
                  className="flex-1"
                >
                  Intera
                </Button>
              </div>
            </div>
            
            {(imageFile || imageUrl) && (
              <div className="mt-2 border rounded-md p-2">
                <p className="text-sm font-medium mb-2">Anteprima:</p>
                <div className={`
                  ${imagePosition === 'left' ? 'float-left mr-4' : ''}
                  ${imagePosition === 'right' ? 'float-right ml-4' : ''}
                  ${imagePosition === 'center' ? 'mx-auto' : ''}
                  ${imagePosition === 'full' ? 'w-full' : 'max-w-[60%]'}
                `}>
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                    alt="Anteprima"
                    className="max-w-full h-auto rounded-md"
                  />
                  {imageCaption && (
                    <p className="text-xs text-center text-gray-500 mt-1">{imageCaption}</p>
                  )}
                </div>
                <div className="clear-both"></div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={insertImageAtCursor}
              disabled={(!imageFile && !imageUrl) || uploadingImage}
            >
              {uploadingImage ? "Inserimento..." : "Inserisci Immagine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
