
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload } from "lucide-react";
import TranslatedText from '@/components/TranslatedText';

interface ImageInsertionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (imageUrl: string, position: "left" | "center" | "right" | "full", caption?: string) => void;
}

const ImageInsertionDialog: React.FC<ImageInsertionDialogProps> = ({
  isOpen,
  onClose,
  onImageUpload
}) => {
  const [position, setPosition] = useState<"left" | "center" | "right" | "full">("center");
  const [caption, setCaption] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'immagine è troppo grande. Il limite è 5MB.");
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onImageUpload(previewUrl, position, caption || undefined);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPosition("center");
    setCaption("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]" data-no-translation="true">
        <DialogHeader>
          <DialogTitle>
            <TranslatedText text="Inserisci immagine" disableAutoTranslation={true} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4" data-no-translation="true">
          {previewUrl ? (
            <div className="space-y-4" data-no-translation="true">
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
              
              <div className="space-y-3" data-no-translation="true">
                <div className="space-y-1.5">
                  <Label htmlFor="position">
                    <TranslatedText text="Posizione dell'immagine" disableAutoTranslation={true} />
                  </Label>
                  <RadioGroup 
                    value={position} 
                    onValueChange={(value) => setPosition(value as "left" | "center" | "right" | "full")}
                    className="flex space-x-2"
                    data-no-translation="true"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="left" id="left" />
                      <Label htmlFor="left">
                        <TranslatedText text="Sinistra" disableAutoTranslation={true} />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="center" id="center" />
                      <Label htmlFor="center">
                        <TranslatedText text="Centro" disableAutoTranslation={true} />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="right" id="right" />
                      <Label htmlFor="right">
                        <TranslatedText text="Destra" disableAutoTranslation={true} />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full">
                        <TranslatedText text="Intera" disableAutoTranslation={true} />
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="caption">
                    <TranslatedText text="Didascalia (opzionale)" disableAutoTranslation={true} />
                  </Label>
                  <Input 
                    id="caption" 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Inserisci una didascalia per l'immagine"
                    data-no-translation="true"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-md border-gray-300 p-4" data-no-translation="true">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">
                <TranslatedText text="Carica un'immagine (JPG, PNG, GIF)" disableAutoTranslation={true} />
              </p>
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  <TranslatedText text="Seleziona file" disableAutoTranslation={true} />
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                  data-no-translation="true"
                />
              </label>
            </div>
          )}
        </div>
        
        <DialogFooter data-no-translation="true">
          <Button 
            variant="outline" 
            onClick={resetForm}
            data-no-translation="true"
          >
            <TranslatedText text="Annulla" disableAutoTranslation={true} />
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!previewUrl}
            data-no-translation="true"
          >
            <TranslatedText text="Inserisci" disableAutoTranslation={true} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertionDialog;
