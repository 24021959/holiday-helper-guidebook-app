
import React from "react";
import { useState, useEffect } from "react";
import { VisualEditor } from "@/components/admin/VisualEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { PageData } from "@/types/page.types";
import { supabase } from "@/integrations/supabase/client";

export interface PageContent {
  title: string;
  content: string;
  images: ImageItem[];
  pageType: "normal" | "submenu" | "parent";
  parentPath?: string;
}

interface AdminCreateProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

const AdminCreate = ({ pageToEdit, onEditComplete }: AdminCreateProps) => {
  const [pageContent, setPageContent] = useState<PageContent>(() => ({
    title: pageToEdit?.title || "",
    content: pageToEdit?.content || "",
    images: pageToEdit?.pageImages?.map(img => ({
      url: img.url,
      position: img.position === "top" ? "left" : 
                img.position === "center" ? "center" : 
                img.position === "bottom" ? "right" : "full",
      caption: img.caption,
      type: "image" as const
    })) || [],
    pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
    parentPath: pageToEdit?.parentPath
  }));

  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const { handleTranslateAndCreate, isCreating, isTranslating } = usePageCreation({
    onPageCreated: (pages) => {
      setPageContent({
        title: "",
        content: "",
        images: [],
        pageType: "normal"
      });
      setUploadedImage(null);
      onEditComplete();
      toast.success(pageToEdit ? "Pagina aggiornata con successo!" : "Pagina creata con successo!");
    }
  });

  // Fetch parent pages
  useEffect(() => {
    const fetchParentPages = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('is_parent', true);

        if (error) throw error;

        if (data) {
          const formattedPages = data.map(page => ({
            id: page.id,
            title: page.title,
            content: page.content,
            path: page.path,
            imageUrl: page.image_url,
            icon: page.icon,
            listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
            listItems: page.list_items,
            isSubmenu: page.is_submenu || false,
            parentPath: page.parent_path || undefined,
            pageImages: [],
            published: page.published,
            is_parent: true
          }));
          setParentPages(formattedPages);
        }
      } catch (error) {
        console.error("Error fetching parent pages:", error);
      }
    };

    fetchParentPages();
  }, []);

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

  const handlePageTypeChange = (value: "normal" | "submenu" | "parent") => {
    setPageContent(prev => ({
      ...prev,
      pageType: value,
      parentPath: value === "normal" ? undefined : prev.parentPath
    }));
  };

  const handleParentPathChange = (value: string) => {
    setPageContent(prev => ({
      ...prev,
      parentPath: value
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
        width: img.width || "100%"
      }));

      await handleTranslateAndCreate(
        {
          title: pageContent.title,
          content: pageContent.content,
          icon: pageToEdit?.icon || "FileText"
        },
        pageContent.pageType,
        pageContent.pageType === "submenu" ? (pageContent.parentPath || "") : "",
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
          <div className="space-y-6">
            <div>
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

            <div>
              <Label htmlFor="pageType" className="text-base font-medium">
                Tipo di pagina
              </Label>
              <Select
                value={pageContent.pageType}
                onValueChange={handlePageTypeChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona il tipo di pagina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Pagina normale</SelectItem>
                  <SelectItem value="submenu">Sottopagina</SelectItem>
                  <SelectItem value="parent">Pagina Master (con sottopagine)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pageContent.pageType === "submenu" && (
              <div>
                <Label htmlFor="parentPath" className="text-base font-medium">
                  Pagina Master
                </Label>
                <Select
                  value={pageContent.parentPath}
                  onValueChange={handleParentPathChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleziona la pagina master" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentPages.length > 0 ? (
                      parentPages.map(page => (
                        <SelectItem key={page.path} value={page.path}>
                          {page.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Nessuna pagina master disponibile
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {pageContent.pageType !== "parent" && (
              <div className="border rounded-lg mt-2">
                <VisualEditor 
                  content={pageContent.content}
                  images={pageContent.images}
                  onChange={handleContentChange}
                  onImageAdd={handleImageAdd}
                />
              </div>
            )}
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
                images: [],
                pageType: "normal"
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
