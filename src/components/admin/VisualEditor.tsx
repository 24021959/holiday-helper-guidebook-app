
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const handleImagePositionChange = (image: ImageDetail, newPosition: "left" | "center" | "right" | "full") => {
    const updatedImage = { ...image, position: newPosition };
    const imageIndex = images.findIndex(img => img.url === image.url);
    const newImages = [...images];
    newImages[imageIndex] = updatedImage;
    // Update images through parent
  };

  return (
    <div className="min-h-[500px] flex flex-col">
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0"
          placeholder="Inizia a scrivere qui..."
        />
      </div>

      <div className="border-t p-4">
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
              <ResizableHandle />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setSelectedImage(image)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </ResizablePanelGroup>
          ))}
        </div>

        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Aggiungi immagine
          </Button>
        </div>
      </div>
    </div>
  );
};
