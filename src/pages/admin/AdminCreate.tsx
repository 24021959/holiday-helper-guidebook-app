
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

  const handleSavePage = () => {
    // Here we would implement the actual save functionality
    console.log("Saving page:", pageContent);
    toast.success("Pagina salvata con successo!");
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
          
          <div className="border rounded-lg overflow-hidden">
            <VisualEditor 
              blocks={pageContent.blocks}
              onChange={handleBlocksChange}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <Button variant="outline">Annulla</Button>
          <Button onClick={handleSavePage}>Salva Pagina</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminCreate;
