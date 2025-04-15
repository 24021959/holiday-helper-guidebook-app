
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
import { PageTypeSection } from "@/components/admin/form/PageTypeSection";
import { useForm } from "react-hook-form";

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
  const form = useForm({
    defaultValues: {
      title: pageToEdit?.title || "",
      content: pageToEdit?.content || "",
      pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
      parentPath: pageToEdit?.parentPath || ""
    }
  });

  const [pageContent, setPageContent] = useState<PageContent>(() => ({
    title: pageToEdit?.title || "",
    content: pageToEdit?.content || "",
    images: pageToEdit?.pageImages?.map(img => ({
      url: img.url,
      position: img.position,
      caption: img.caption || "",
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

        if (error) {
          // If the is_parent column doesn't exist yet, try to get pages marked as parent another way
          console.error("Error fetching parent pages:", error);
          
          // Fallback to getting parent pages without the is_parent column
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('custom_pages')
            .select('*');
            
          if (fallbackError) throw fallbackError;
          
          if (fallbackData) {
            // Try to identify parent pages using other indicators
            const potentialParentPages = fallbackData.filter(page => 
              !page.is_submenu && !page.parent_path
            );
            
            const formattedPages = potentialParentPages.map(page => ({
              id: page.id,
              title: page.title,
              content: page.content,
              path: page.path,
              imageUrl: page.image_url,
              icon: page.icon,
              listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
              listItems: page.list_items,
              isSubmenu: false,
              parentPath: undefined,
              pageImages: [],
              published: page.published,
              is_parent: true
            }));
            setParentPages(formattedPages);
          }
          return;
        }

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

    if (pageContent.pageType === "submenu" && !pageContent.parentPath) {
      toast.error("Seleziona una pagina master per la sottopagina");
      return;
    }

    try {
      await handleTranslateAndCreate(
        {
          title: pageContent.title,
          content: pageContent.content,
          icon: pageToEdit?.icon || "FileText"
        },
        pageContent.pageType,
        pageContent.pageType === "submenu" ? (pageContent.parentPath || "") : "",
        uploadedImage,
        pageContent.images,
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

            <PageTypeSection 
              pageType={pageContent.pageType}
              setPageType={handlePageTypeChange}
              parentPath={pageContent.parentPath || ""}
              setParentPath={handleParentPathChange}
              parentPages={parentPages}
              control={form.control}
            />

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
            className="bg-emerald-600 hover:bg-emerald-700"
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
