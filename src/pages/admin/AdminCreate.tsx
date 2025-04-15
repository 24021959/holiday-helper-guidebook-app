import React from "react";
import { useState, useEffect } from "react";
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
import { PageData } from "@/types/page.types";

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

interface AdminCreateProps {
  initialPage?: PageData | null;
  onPageCreated: (pages: any[]) => void;
}

const AdminCreate: React.FC<AdminCreateProps> = ({ initialPage, onPageCreated }) => {
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
      toast.success("Pagina creata con successo!");
    }
  });

  useEffect(() => {
    if (initialPage) {
      setPageContent({
        title: initialPage.title,
        content: initialPage.content,
        images: initialPage.pageImages || []
      });
      setUploadedImage(initialPage.imageUrl);
    }
  }, [initialPage]);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {initialPage ? 'Modifica pagina' : 'Crea una nuova pagina'}
          </CardTitle>
          <CardDescription>
            {initialPage ? 'Modifica la pagina esistente' : 'Utilizza l\'editor visuale per creare una nuova pagina'}
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

          <div className="border rounded-lg mt-2">
            <VisualEditor 
              content={pageContent.content}
              images={pageContent.images}
              onChange={handleContentChange}
              onImageAdd={handleImageAdd}
            />
          </div>
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
