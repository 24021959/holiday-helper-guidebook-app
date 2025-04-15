
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
    images: pageToEdit?.pageImages.map(img => ({
      url: img.url,
      position: (img.position === "top" || img.position === "bottom") ? "center" : img.position as "left" | "center" | "right" | "full",
      caption: img.caption || "",
      type: "image" as const
    })) || [],
    pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
    parentPath: pageToEdit?.parentPath
  }));

  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
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

  useEffect(() => {
    const fetchParentPages = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('is_submenu', false);
        
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
            listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
            isSubmenu: page.is_submenu || false,
            parentPath: page.parent_path || undefined,
            pageImages: [],
            published: page.published || false,
            is_parent: false
          }));
          
          setParentPages(formattedPages);
        }
      } catch (error) {
        console.error("Error fetching parent pages:", error);
        toast.error("Errore nel caricamento delle pagine genitore");
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
        type: "image" as const,
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

            <div className="space-y-4">
              <Label htmlFor="pageType" className="text-base font-medium">
                Tipo di pagina
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={pageContent.pageType === "normal" ? "default" : "outline"}
                  className={pageContent.pageType === "normal" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => handlePageTypeChange("normal")}
                >
                  Pagina normale
                </Button>
                <Button
                  type="button"
                  variant={pageContent.pageType === "submenu" ? "default" : "outline"}
                  className={pageContent.pageType === "submenu" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => handlePageTypeChange("submenu")}
                >
                  Sottopagina
                </Button>
                <Button
                  type="button"
                  variant={pageContent.pageType === "parent" ? "default" : "outline"}
                  className={pageContent.pageType === "parent" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => handlePageTypeChange("parent")}
                >
                  Pagina genitore
                </Button>
              </div>
            </div>

            {pageContent.pageType === "submenu" && (
              <div>
                <Label htmlFor="parentPath" className="text-base font-medium">
                  Pagina principale
                </Label>
                <select 
                  id="parentPath"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={pageContent.parentPath || ""}
                  onChange={(e) => handleParentPathChange(e.target.value)}
                >
                  <option value="">Seleziona una pagina genitore</option>
                  {parentPages.map((page) => (
                    <option key={page.path} value={page.path}>
                      {page.title}
                    </option>
                  ))}
                </select>
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
