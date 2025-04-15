
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ImageIcon, MapPin, Phone, AlignLeft, AlignCenter, AlignRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';

interface ImageDetail {
  url: string;
  width: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
}

interface VisualEditorProps {
  content: string;
  images: ImageDetail[];
  onChange: (content: string) => void;
  onImageAdd: (image: ImageDetail) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  content,
  images,
  onChange,
  onImageAdd
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImage: ImageDetail = {
            url: event.target.result as string,
            width: "50%",
            position: "center",
          };
          onImageAdd(newImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full justify-start mb-2">
          <TabsTrigger value="content">Contenuto</TabsTrigger>
          <TabsTrigger value="insert">Inserisci</TabsTrigger>
          <TabsTrigger value="format">Formattazione</TabsTrigger>
          <TabsTrigger value="view">Visualizzazione</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="min-h-[500px] border rounded-lg p-4 bg-white">
            <Textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0"
              placeholder="Inizia a scrivere qui..."
            />
          </div>
        </TabsContent>

        <TabsContent value="insert" className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-white text-center hover:bg-gray-50 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Label
              htmlFor="image-upload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span>Immagine</span>
            </Label>
          </div>

          <div className="p-4 border rounded-lg bg-white text-center hover:bg-gray-50 cursor-pointer">
            <Label className="flex flex-col items-center gap-2 cursor-pointer">
              <MapPin className="h-8 w-8 text-gray-400" />
              <span>Mappa</span>
            </Label>
          </div>

          <div className="p-4 border rounded-lg bg-white text-center hover:bg-gray-50 cursor-pointer">
            <Label className="flex flex-col items-center gap-2 cursor-pointer">
              <Phone className="h-8 w-8 text-gray-400" />
              <span>Telefono</span>
            </Label>
          </div>
        </TabsContent>

        <TabsContent value="format" className="flex gap-2">
          <Button variant="outline" size="sm">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <AlignRight className="h-4 w-4" />
          </Button>
        </TabsContent>

        <TabsContent value="view" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Anteprima
          </Button>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <ResizablePanelGroup
            key={index}
            direction="horizontal"
            className={cn(
              "relative group border rounded-lg overflow-hidden",
              image.position === "left" && "float-left mr-4",
              image.position === "right" && "float-right ml-4",
              image.position === "center" && "mx-auto",
              image.position === "full" && "w-full"
            )}
            style={{ width: image.width }}
          >
            <ResizablePanel>
              <img
                src={image.url}
                alt={image.caption || `Immagine ${index + 1}`}
                className="w-full h-auto object-contain"
              />
              {image.caption && (
                <div className="text-sm text-center p-2 bg-gray-50">
                  {image.caption}
                </div>
              )}
            </ResizablePanel>
            <ResizableHandle withHandle />
          </ResizablePanelGroup>
        ))}
      </div>
    </div>
  );
};
