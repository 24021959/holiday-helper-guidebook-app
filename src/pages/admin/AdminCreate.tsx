
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
import { ImageItem, ImageDetail } from "@/types/image.types";
import { PageData } from "@/types/page.types";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PageType } from "@/types/form.types";
import IconRenderer from "@/components/IconRenderer";

export interface PageContent {
  title: string;
  content: string;
  images: ImageItem[];
  pageType: PageType;
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
      position: img.position,
      caption: img.caption || "",
      type: "image" as const,
      width: "100%"
    })) || [],
    pageType: pageToEdit?.is_parent ? "parent" : pageToEdit?.isSubmenu ? "submenu" : "normal",
    parentPath: pageToEdit?.parentPath
  }));

  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(pageToEdit?.imageUrl || null);
  const [selectedIcon, setSelectedIcon] = useState<string>(pageToEdit?.icon || "FileText");
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

  const iconOptions = [
    { value: 'FileText', label: 'Documento' },
    { value: 'Image', label: 'Immagine' },
    { value: 'MessageCircle', label: 'Messaggio' },
    { value: 'Info', label: 'Informazioni' },
    { value: 'Map', label: 'Mappa' },
    { value: 'Utensils', label: 'Ristorante' },
    { value: 'Landmark', label: 'Monumento' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Wifi', label: 'WiFi' },
    { value: 'Bus', label: 'Bus' },
    { value: 'ShoppingBag', label: 'Shopping' },
    { value: 'Calendar', label: 'Calendario' },
    { value: 'Phone', label: 'Telefono' },
    { value: 'Book', label: 'Libro' },
    { value: 'Coffee', label: 'Caffè' },
    { value: 'Home', label: 'Casa' },
    { value: 'Bike', label: 'Bicicletta' },
    { value: 'Camera', label: 'Fotocamera' },
    { value: 'Globe', label: 'Mondo' },
    { value: 'Mountain', label: 'Montagna' },
    { value: 'MapPin', label: 'Posizione' },
  ];

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
            is_parent: page.is_parent || false
          }));
          
          setParentPages(formattedPages);
          console.log("Fetched parent pages:", formattedPages);
        }
      } catch (error) {
        console.error("Error fetching parent pages:", error);
        toast.error("Errore nel caricamento delle pagine genitore");
      }
    };
    
    fetchParentPages();
  }, []);

  const filteredParentPages = parentPages.filter(page => {
    const isItalianPage = !page.path.startsWith('/en/') && 
                          !page.path.startsWith('/de/') && 
                          !page.path.startsWith('/fr/') && 
                          !page.path.startsWith('/es/');
    
    const isParentPage = page.is_parent === true;
    
    return isItalianPage && isParentPage;
  });

  console.log("Filtered Italian parent pages in AdminCreate:", filteredParentPages);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageContent(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleIconChange = (value: string) => {
    setSelectedIcon(value);
  };

  const handleContentChange = (newContent: string) => {
    setPageContent(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleImageAdd = (imageDetail: ImageDetail) => {
    const newImage: ImageItem = {
      ...imageDetail,
      type: "image",
      width: imageDetail.width || "100%"
    };
    
    setPageContent(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const handlePageTypeChange = (value: PageType) => {
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
          icon: selectedIcon || "FileText",
          pageType: pageContent.pageType,
          parentPath: pageContent.parentPath
        },
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
            
            {/* Nuovo campo per selezionare l'icona */}
            <div>
              <Label htmlFor="pageIcon" className="text-base font-medium">
                Icona della pagina
              </Label>
              <Select
                value={selectedIcon}
                onValueChange={handleIconChange}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Seleziona un'icona">
                    <div className="flex items-center gap-2">
                      <IconRenderer iconName={selectedIcon} size="small" />
                      <span>{iconOptions.find(opt => opt.value === selectedIcon)?.label || selectedIcon}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {iconOptions.map((iconOption) => (
                    <SelectItem key={iconOption.value} value={iconOption.value}>
                      <div className="flex items-center gap-2">
                        <IconRenderer iconName={iconOption.value} size="small" />
                        <span>{iconOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Card per mostrare l'icona selezionata */}
            <div>
              <Card className="mt-2">
                <CardContent className="pt-6">
                  <div className="mb-2">
                    <strong>Icona selezionata:</strong>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                    <IconRenderer iconName={selectedIcon} size="medium" />
                    <span className="text-sm">{selectedIcon}</span>
                  </div>
                </CardContent>
              </Card>
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
                <Select
                  value={pageContent.parentPath || ""}
                  onValueChange={handleParentPathChange}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Seleziona una pagina genitore" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredParentPages.length > 0 ? (
                      filteredParentPages.map((page) => (
                        <SelectItem key={page.path} value={page.path}>
                          {page.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Nessuna pagina genitore disponibile
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
