
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import ImageUploader from "../../ImageUploader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Trash, MoveVertical } from "lucide-react";

export interface ImageItem {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  type?: "image";
  order?: number;
  insertInContent?: boolean;
}

interface PageMultiImageSectionProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
}

export const PageMultiImageSection: React.FC<PageMultiImageSectionProps> = ({
  images,
  onImagesChange
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  
  const handleImageUploaded = (url: string) => {
    setCurrentImageUrl(url);
  };

  const addImage = () => {
    if (!currentImageUrl) return;
    
    const newImage: ImageItem = {
      url: currentImageUrl,
      position: "center",
      caption: "",
      type: "image",
      insertInContent: false,
      order: images.length > 0 ? Math.max(...images.map(img => img.order || 0)) + 1 : 0
    };
    
    onImagesChange([...images, newImage]);
    setCurrentImageUrl("");
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const updatedImages = [...images];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[index - 1];
    updatedImages[index - 1] = temp;
    onImagesChange(updatedImages);
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const updatedImages = [...images];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[index + 1];
    updatedImages[index + 1] = temp;
    onImagesChange(updatedImages);
  };

  const updateImagePosition = (index: number, position: "left" | "center" | "right" | "full") => {
    const updatedImages = [...images];
    updatedImages[index].position = position;
    onImagesChange(updatedImages);
  };

  const updateImageCaption = (index: number, caption: string) => {
    const updatedImages = [...images];
    updatedImages[index].caption = caption;
    onImagesChange(updatedImages);
  };

  const toggleInsertInContent = (index: number) => {
    const updatedImages = [...images];
    updatedImages[index].insertInContent = !updatedImages[index].insertInContent;
    onImagesChange(updatedImages);
  };

  const updateImageOrder = (index: number, order: number) => {
    const updatedImages = [...images];
    updatedImages[index].order = order;
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <Label>Immagini della pagina</Label>
      
      {/* Upload di nuova immagine */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h4 className="text-sm font-medium mb-3">Aggiungi una nuova immagine</h4>
        <div className="space-y-3">
          <ImageUploader onImageUpload={handleImageUploaded} />
          
          {currentImageUrl && (
            <div className="mt-2">
              <img 
                src={currentImageUrl} 
                alt="Preview" 
                className="h-24 object-cover rounded-md mb-2"
              />
              <Button 
                onClick={addImage} 
                className="w-full"
              >
                Aggiungi all'elenco
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Elenco immagini aggiunte */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Immagini aggiunte ({images.length})</h4>
          
          <div className="space-y-4">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="border rounded-md p-3 bg-white"
              >
                <div className="flex gap-3">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={image.url} 
                      alt={`Immagine ${index + 1}`} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={`img-pos-${index}`}>Posizione</Label>
                      <div className="flex space-x-1">
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => moveImageUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => moveImageDown(index)}
                          disabled={index === images.length - 1}
                          className="h-6 w-6"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => removeImage(index)}
                          className="h-6 w-6 text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Select
                      value={image.position}
                      onValueChange={(value) => updateImagePosition(index, value as "left" | "center" | "right" | "full")}
                    >
                      <SelectTrigger id={`img-pos-${index}`}>
                        <SelectValue placeholder="Seleziona posizione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Sinistra</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Destra</SelectItem>
                        <SelectItem value="full">Larghezza completa</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div>
                      <Label htmlFor={`img-caption-${index}`}>Didascalia (opzionale)</Label>
                      <Input
                        id={`img-caption-${index}`}
                        value={image.caption || ""}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        placeholder="Aggiungi una didascalia"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id={`img-insert-${index}`}
                        checked={image.insertInContent || false}
                        onChange={() => toggleInsertInContent(index)}
                        className="mr-2 h-4 w-4 text-emerald-600 rounded border-gray-300"
                      />
                      <Label htmlFor={`img-insert-${index}`} className="text-sm">
                        Inserisci nel testo della pagina
                      </Label>
                    </div>

                    {image.insertInContent && (
                      <div className="pt-2">
                        <Label htmlFor={`img-order-${index}`} className="text-sm">
                          Ordine nel testo (valore numerico)
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <MoveVertical className="h-4 w-4 text-gray-500" />
                          <Input
                            id={`img-order-${index}`}
                            type="number"
                            min="0"
                            value={image.order || 0}
                            onChange={(e) => updateImageOrder(index, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Più basso il valore, più in alto apparirà nel testo. Valori uguali rispetteranno l'ordine nella galleria.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
