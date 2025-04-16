
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ImageDetail } from '@/types/image.types';
import { Edit2, X, PanelLeft, PanelRight, AlignCenter, ArrowUpRight, Trash2 } from 'lucide-react';

interface ImageGalleryProps {
  images: ImageDetail[];
  content: string;
  hoveredImageIndex: number | null;
  showImageControls: number | null;
  onImageMouseEnter: (index: number) => void;
  onImageMouseLeave: () => void;
  onToggleControls: (index: number) => void;
  onPositionChange: (index: number, position: "left" | "center" | "right" | "full") => void;
  onWidthChange: (index: number, width: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
  onDeleteImage: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  content,
  hoveredImageIndex,
  showImageControls,
  onImageMouseEnter,
  onImageMouseLeave,
  onToggleControls,
  onPositionChange,
  onWidthChange,
  onCaptionChange,
  onDeleteImage,
}) => {
  if (images.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium mb-3">Immagini inserite</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index}
            className="relative border rounded-md overflow-hidden bg-white group"
            onMouseEnter={() => onImageMouseEnter(index)}
            onMouseLeave={onImageMouseLeave}
          >
            <img 
              src={image.url} 
              alt={image.caption || `Immagine ${index + 1}`}
              className="w-full h-32 object-cover"
            />
            
            <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center ${hoveredImageIndex === index ? 'opacity-100' : 'opacity-0'}`}>
              <Button 
                variant="secondary" 
                size="sm" 
                className="z-10"
                onClick={() => onToggleControls(index)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Modifica
              </Button>
            </div>
            
            <Badge className="absolute top-1 right-1 bg-gray-700 text-white">
              {image.position === "left" ? "SX" : 
               image.position === "right" ? "DX" : 
               image.position === "full" ? "100%" : 
               "Centro"}
            </Badge>
            
            {showImageControls === index && (
              <div className="absolute inset-0 bg-white z-20 p-3 flex flex-col">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm">Modifica immagine</span>
                  <Button variant="ghost" size="icon" onClick={() => onToggleControls(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3 flex-1">
                  <div>
                    <Label htmlFor={`img-position-${index}`} className="text-xs">Posizione</Label>
                    <div className="flex gap-1 mt-1">
                      <Button 
                        variant={image.position === "left" ? "default" : "outline"} 
                        size="sm"
                        className="px-2 py-1 h-8"
                        onClick={() => onPositionChange(index, "left")}
                      >
                        <PanelLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={image.position === "center" ? "default" : "outline"} 
                        size="sm"
                        className="px-2 py-1 h-8"
                        onClick={() => onPositionChange(index, "center")}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={image.position === "right" ? "default" : "outline"} 
                        size="sm"
                        className="px-2 py-1 h-8"
                        onClick={() => onPositionChange(index, "right")}
                      >
                        <PanelRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={image.position === "full" ? "default" : "outline"} 
                        size="sm"
                        className="px-2 py-1 h-8"
                        onClick={() => onPositionChange(index, "full")}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor={`img-width-${index}`} className="text-xs">Larghezza ({parseInt(image.width)}%)</Label>
                    </div>
                    <Slider
                      id={`img-width-${index}`}
                      min={10}
                      max={100}
                      step={5}
                      defaultValue={[parseInt(image.width)]}
                      onValueChange={(value) => onWidthChange(index, value[0])}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`img-caption-${index}`} className="text-xs">Didascalia</Label>
                    <Input
                      id={`img-caption-${index}`}
                      value={image.caption || ''}
                      onChange={(e) => onCaptionChange(index, e.target.value)}
                      placeholder="Aggiungi didascalia"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDeleteImage(index)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Elimina immagine
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
