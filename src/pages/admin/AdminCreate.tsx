
import React from "react";
import { useState } from "react";
import { VisualEditor } from "@/components/admin/VisualEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { usePageCreation } from "@/hooks/usePageCreation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Heading1, Heading2, Quote, Link as LinkIcon,
  ImageIcon, Phone, MapPin, TypeIcon
} from "lucide-react";

export interface PageContent {
  title: string;
  content: string;
  images: ImageDetail[];
}

interface ImageDetail {
  url: string;
  width: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
}

const AdminCreate = () => {
  const [pageContent, setPageContent] = useState<PageContent>({
    title: "",
    content: "",
    images: []
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { handleTranslateAndCreate, isCreating, isTranslating } = usePageCreation({
    onPageCreated: (pages) => {
      setPageContent({
        title: "",
        content: "",
        images: []
      });
      setUploadedImage(null);
    }
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageContent(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleContentChange = (newContent: string) => {
    setPageContent(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleImageAdd = (imageDetail: ImageDetail) => {
    setPageContent(prev => ({
      ...prev,
      images: [...prev.images, imageDetail]
    }));
  };

  const handleSavePage = async () => {
    if (!pageContent.title) {
      toast.error("Inserisci un titolo per la pagina");
      return;
    }

    try {
      const pageImages = pageContent.images.map(img => ({
        url: img.url,
        position: img.position,
        caption: img.caption,
        type: "image" as const
      }));

      await handleTranslateAndCreate(
        {
          title: pageContent.title,
          content: pageContent.content,
          icon: "FileText"
        },
        "normal",
        "",
        uploadedImage,
        pageImages,
        () => {
          toast.success("Pagina creata con successo!");
        }
      );
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Errore nel salvare la pagina");
    }
  };

  const formatButtons = [
    { icon: <Bold className="h-4 w-4" />, action: 'bold', label: 'Grassetto' },
    { icon: <Italic className="h-4 w-4" />, action: 'italic', label: 'Corsivo' },
    { icon: <Heading1 className="h-4 w-4" />, action: 'h1', label: 'Titolo 1' },
    { icon: <Heading2 className="h-4 w-4" />, action: 'h2', label: 'Titolo 2' },
    { icon: <List className="h-4 w-4" />, action: 'bullet', label: 'Elenco puntato' },
    { icon: <ListOrdered className="h-4 w-4" />, action: 'number', label: 'Elenco numerato' },
    { icon: <Quote className="h-4 w-4" />, action: 'quote', label: 'Citazione' },
    { icon: <LinkIcon className="h-4 w-4" />, action: 'link', label: 'Link' },
    { icon: <AlignLeft className="h-4 w-4" />, action: 'left', label: 'Allinea a sinistra' },
    { icon: <AlignCenter className="h-4 w-4" />, action: 'center', label: 'Centra' },
    { icon: <AlignRight className="h-4 w-4" />, action: 'right', label: 'Allinea a destra' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Crea una nuova pagina
          </CardTitle>
          <CardDescription>
            Utilizza l'editor visuale per creare una nuova pagina
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="pageTitle" className="text-base font-medium">
              Titolo della pagina
            </Label>
            <Input 
              id="pageTitle" 
              placeholder="Inserisci il titolo della pagina" 
              className="mt-1 text-lg font-medium"
              value={pageContent.title}
              onChange={handleTitleChange}
            />
          </div>

          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="w-full bg-blue-50 mb-2">
              <TabsTrigger value="editor" className="flex-1">
                <TypeIcon className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1">
                <ImageIcon className="w-4 h-4 mr-2" />
                Immagini
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                Mappa
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border-b">
              {formatButtons.map((btn, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {/* formatting logic */}}
                >
                  {btn.icon}
                  <span className="sr-only">{btn.label}</span>
                </Button>
              ))}
            </div>

            <div className="border rounded-lg mt-2">
              <VisualEditor 
                content={pageContent.content}
                images={pageContent.images}
                onChange={handleContentChange}
                onImageAdd={handleImageAdd}
              />
            </div>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <Button variant="outline">Annulla</Button>
          <Button 
            onClick={handleSavePage}
            disabled={isCreating || isTranslating}
          >
            {isCreating ? (
              "Salvataggio in corso..."
            ) : isTranslating ? (
              "Traduzione in corso..."
            ) : (
              "Salva Pagina"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminCreate;
