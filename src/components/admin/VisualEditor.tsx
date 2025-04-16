
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageDetail } from '@/types/image.types';
import { Image, Phone, Map, FileImage, Type, Plus } from 'lucide-react';

interface VisualEditorProps {
  content: string;
  images: ImageDetail[];
  onChange: (content: string) => void;
  onImageAdd?: (image: ImageDetail) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  content,
  images,
  onChange,
  onImageAdd
}) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  
  const insertImage = (image: ImageDetail, align: 'left' | 'center' | 'right' = 'center') => {
    const imageTag = `[IMAGE:${image.id}|${align}]`;
    const newContent = content ? `${content}\n\n${imageTag}` : imageTag;
    onChange(newContent);
    setShowImageDialog(false);
  };
  
  const insertText = () => {
    const textBlock = `\n\nScrivere qui il testo del paragrafo...\n\n`;
    onChange(content ? content + textBlock : textBlock);
  };
  
  const insertPhoneNumber = () => {
    const phoneBlock = `\n\n[PHONE:+39 000 000 0000]\n\n`;
    onChange(content ? content + phoneBlock : phoneBlock);
  };
  
  const insertMap = () => {
    const mapBlock = `\n\n[MAP:41.9028,12.4964]\n\n`;
    onChange(content ? content + mapBlock : mapBlock);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 border-emerald-200 text-emerald-700"
          onClick={insertText}
        >
          <Type className="w-4 h-4" />
          <span>Aggiungi Testo</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-emerald-200 text-emerald-700"
          onClick={() => setShowImageDialog(true)}
        >
          <Image className="w-4 h-4" />
          <span>Aggiungi Immagine</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-emerald-200 text-emerald-700"
          onClick={insertPhoneNumber}
        >
          <Phone className="w-4 h-4" />
          <span>Aggiungi Telefono</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-emerald-200 text-emerald-700"
          onClick={insertMap}
        >
          <Map className="w-4 h-4" />
          <span>Aggiungi Mappa</span>
        </Button>
      </div>
      
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Seleziona un'immagine</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <ScrollArea className="h-72 px-1">
              {images && images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div 
                      key={image.id} 
                      className="border rounded-lg overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors"
                      onClick={() => insertImage(image)}
                    >
                      <img 
                        src={image.url} 
                        alt={image.name || 'Immagine'}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2 text-xs truncate">{image.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FileImage className="h-12 w-12 mb-4 opacity-30" />
                  <p>Nessuna immagine disponibile</p>
                  {onImageAdd && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" /> 
                      Carica immagine
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                if (images.length > 0) {
                  insertImage(images[0], 'left');
                }
              }}
            >
              Allinea a sinistra
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => {
                if (images.length > 0) {
                  insertImage(images[0], 'center');
                }
              }}
            >
              Centra
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => {
                if (images.length > 0) {
                  insertImage(images[0], 'right');
                }
              }}
            >
              Allinea a destra
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Card className="border-emerald-100">
        <CardContent className="p-3">
          <div className="bg-gray-50 p-4 rounded-md border border-emerald-100 min-h-[200px]">
            {content ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <div className="text-gray-400 italic">
                Il contenuto verrà visualizzato qui. Usa i pulsanti sopra per aggiungere elementi.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
