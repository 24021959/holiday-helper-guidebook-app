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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypeIcon, ImageIcon, Phone, MapPin } from "lucide-react";

export interface PageContent {
  title: string;
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  type: "text" | "image" | "phone" | "map";
  content: string;
  caption?: string;
  position?: "left" | "center" | "right" | "full";
}

const AdminCreate = () => {
  const [pageContent, setPageContent] = useState<PageContent>({
    title: "",
    blocks: []
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { handleTranslateAndCreate, isCreating, isTranslating } = usePageCreation({
    onPageCreated: (pages) => {
      setPageContent({
        title: "",
        blocks: []
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

  const handleBlocksChange = (newBlocks: ContentBlock[]) => {
    setPageContent(prev => ({
      ...prev,
      blocks: newBlocks
    }));
  };

  const addContentBlock = (type: "text" | "image" | "phone" | "map") => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: "",
      position: "full"
    };
    
    setPageContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const handleSavePage = async () => {
    if (!pageContent.title) {
      toast.error("Inserisci un titolo per la pagina");
      return;
    }

    try {
      const pageImages = pageContent.blocks
        .filter(block => block.type === "image")
        .map(block => ({
          url: block.content,
          position: block.position || "full",
          caption: block.caption,
          type: "image" as const
        }));

      let formattedContent = pageContent.blocks
        .filter(block => block.type !== "image")
        .map(block => {
          if (block.type === "text") {
            return block.content;
          } else if (block.type === "phone") {
            return `📞 ${block.caption || "Telefono"}: ${block.content}`;
          } else if (block.type === "map") {
            return `📍 ${block.caption || "Indirizzo"}: ${block.content}`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n\n");

      await handleTranslateAndCreate(
        {
          title: pageContent.title,
          content: formattedContent,
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

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Crea una nuova pagina
          </CardTitle>
          <CardDescription>
            Utilizza l'editor visuale per creare una nuova pagina con testo, immagini e contenuti interattivi
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

          <Tabs defaultValue="editor" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-blue-50">
              <TabsTrigger 
                value="text" 
                onClick={() => addContentBlock("text")}
                className="flex items-center gap-2 data-[state=active]:bg-blue-200"
              >
                <TypeIcon className="w-4 h-4" />
                <span>Testo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                onClick={() => addContentBlock("image")}
                className="flex items-center gap-2 data-[state=active]:bg-green-200"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Immagine</span>
              </TabsTrigger>
              <TabsTrigger 
                value="phone" 
                onClick={() => addContentBlock("phone")}
                className="flex items-center gap-2 data-[state=active]:bg-yellow-200"
              >
                <Phone className="w-4 h-4" />
                <span>Telefono</span>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                onClick={() => addContentBlock("map")}
                className="flex items-center gap-2 data-[state=active]:bg-purple-200"
              >
                <MapPin className="w-4 h-4" />
                <span>Mappa</span>
              </TabsTrigger>
            </TabsList>

            <div className="border rounded-lg overflow-hidden shadow-sm">
              <VisualEditor 
                blocks={pageContent.blocks}
                onChange={handleBlocksChange}
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
