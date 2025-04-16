
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Image } from "lucide-react";

export const MediaPanel: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  
  // Immagini di esempio
  const demoImages = [
    "/lovable-uploads/075a9ac2-23e8-482c-beb3-45d28a3dcd94.png",
    "/lovable-uploads/47eda6f0-892f-48ac-a78f-d40b2f7a41df.png",
    "/lovable-uploads/5303c7bc-6aa0-4c3b-bbc2-1c94e0d01b97.png"
  ];
  
  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium text-blue-800">
                Immagini della Pagina
              </Label>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Carica Immagine
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {demoImages.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="relative rounded-lg border border-blue-200 overflow-hidden group"
                >
                  <img 
                    src={imageUrl} 
                    alt={`Immagine ${index + 1}`} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-blue-800">
                      <Image className="h-4 w-4 mr-1" />
                      Inserisci
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-dashed border-blue-200 rounded-lg h-48 flex items-center justify-center bg-blue-50">
                <Button variant="ghost" className="text-blue-600">
                  <Plus className="h-6 w-6 mr-2" />
                  Aggiungi immagine
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
