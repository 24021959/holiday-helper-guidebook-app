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
import { ImageItem } from "@/types/image.types";

export interface PageContent {
  title: string;
  content: string;
  images: ImageItem[];
}

interface ImageDetail extends ImageItem {
  width: string;
}

interface AdminCreateProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

const AdminCreate = ({ pageToEdit, onEditComplete }: AdminCreateProps) => {
  const [pageContent, setPageContent] = useState<PageContent>(() => ({
    title: pageToEdit?.title || "",
    content: pageToEdit?.content || "",
    images: pageToEdit?.pageImages || []
  }));

  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
  const { handleTranslateAndCreate, isCreating, isTranslating } = usePageCreation({
    onPageCreated: (pages) => {
      setPageContent({
        title: "",
        content: "",
        images: []
      });
      setUploadedImage(null);
      onEditComplete();
      toast.success(pageToEdit ? "Pagina aggiornata con successo!" : "Pagina creata con successo!");
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

  const handleImageAdd = (imageDetail: ImageItem) => {
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
        ...img,
        type: "image" as const,
        width: img.width || "100%"
      }));

      await handleTranslateAndCreate(
        {
          title: pageContent.title,
          content: pageContent.content,
          icon: pageToEdit?.icon || "FileText"
        },
        pageToEdit?.listType || "normal",
        pageToEdit?.parentPath || "",
        uploadedImage,
        pageImages,
        () => {
          toast.success(pageToEdit ? "Pagina aggiornata con successo!" : "Pagina creata con successo!");
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
            {pageToEdit ? "Modifica pagina" : "Crea una nuova pagina"}
          </CardTitle>
          <CardDescription>
            {pageToEdit 
              ? "Modifica i contenuti della pagina esistente"
              : "Utilizza l'editor visuale per creare una nuova pagina"
            }
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
          <Button 
            variant="outline" 
            onClick={() => {
              if (pageToEdit) {
                onEditComplete();
              }
              setPageContent({
                title: "",
                content: "",
                images: []
              });
              setUploadedImage(null);
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSavePage}
            disabled={isCreating || isTranslating}
          >
            {isCreating ? (
              "Salvataggio in corso..."
            ) : isTranslating ? (
              "Traduzione in corso..."
            ) : pageToEdit ? (
              "Aggiorna Pagina"
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
