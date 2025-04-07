
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { ImageItem } from "@/pages/Admin";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export interface EditPageFormProps {
  page: any;
  parentPages: any[];
  onPageUpdated: (updatedPage: any) => void;
  onFormClose?: () => void;
  keywordToIconMap: Record<string, string>;
  isSystemPage?: boolean;
}

export const EditPageForm: React.FC<EditPageFormProps> = ({ 
  page,
  parentPages,
  onPageUpdated,
  onFormClose = () => {},
  keywordToIconMap,
  isSystemPage = false
}) => {
  const [title, setTitle] = useState(page.title);
  const [path, setPath] = useState(page.path);
  const [imageUrl, setImageUrl] = useState(page.imageUrl || "");
  const [selectedIcon, setSelectedIcon] = useState(page.icon || "");
  const [isSubmenu, setIsSubmenu] = useState(page.isSubmenu || false);
  const [parentPath, setParentPath] = useState(page.parentPath || "");
  const [editorState, setEditorState] = useState(page.content);
  const [listItems, setListItems] = useState(page.listItems || []);
  const [listType, setListType] = useState<string | undefined>(page.listType || undefined);
  const [pageImages, setPageImages] = useState<ImageItem[]>(page.pageImages || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(page.published || false);
  
  useEffect(() => {
    setTitle(page.title);
    setPath(page.path);
    setImageUrl(page.imageUrl || "");
    setSelectedIcon(page.icon || "");
    setIsSubmenu(page.isSubmenu || false);
    setParentPath(page.parentPath || "");
    setEditorState(page.content);
    setListItems(page.listItems || []);
    setListType(page.listType || undefined);
    setPageImages(page.pageImages || []);
    setIsPublished(page.published || false);
  }, [page]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Process multiple images
      let processedImages = pageImages.map(img => ({
        url: img.url,
        position: img.position,
        caption: img.caption,
        type: "image" as const // Ensure type is explicitly set as required
      }));
      
      // Handle empty content
      if (!editorState.trim()) {
        toast.error("Il contenuto non può essere vuoto");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare content with images section at the end if there are images
      let fullContent = editorState;
      
      if (processedImages.length > 0) {
        fullContent += '\n\n<!-- IMAGES -->\n';
        processedImages.forEach(img => {
          fullContent += JSON.stringify(img) + '\n';
        });
      }
      
      // Prepare the page data
      const data = {
        id: page.id,
        title: title,
        content: fullContent,
        path: path,
        image_url: imageUrl,
        icon: selectedIcon,
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null,
        list_items: listItems,
        list_type: listType,
        published: true // Sempre pubblicato automaticamente
      };
      
      // Update the page in Supabase
      const { error } = await supabase
        .from('custom_pages')
        .update(data)
        .eq('id', page.id);
      
      if (error) throw error;
      
      // Aggiorna anche l'icona del menu
      const iconData = {
        label: data.title,
        path: data.path,
        icon: data.icon,
        parent_path: data.parent_path
      };
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .update(iconData)
        .eq('path', data.path);
      
      if (iconError) {
        console.warn("Errore nell'aggiornamento dell'icona del menu:", iconError);
      }
      
      // Prepare the page data for the parent callback
      const updatedPage = {
        id: data.id,
        title: data.title,
        content: data.content,
        path: data.path,
        imageUrl: data.image_url,
        icon: data.icon,
        isSubmenu: data.is_submenu,
        parentPath: data.parent_path,
        listItems: Array.isArray(data.list_items) ? data.list_items : [],
        listType: data.list_type as 'restaurants' | 'activities' | 'locations' | undefined,
        pageImages: processedImages, // Use our processed images with the correct type
        published: true // Sempre pubblicato automaticamente
      };
      
      // Call the parent callback
      onPageUpdated(updatedPage);
      
      toast.success("Pagina aggiornata con successo");
      onFormClose();
    } catch (error) {
      console.error("Errore nell'aggiornamento della pagina:", error);
      toast.error("Errore nell'aggiornamento della pagina");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titolo</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="path">Percorso (path)</Label>
        <Input
          type="text"
          id="path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="imageUrl">URL Immagine</Label>
        <Input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="icon">Icona</Label>
        <Select value={selectedIcon} onValueChange={setSelectedIcon}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona un'icona" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(keywordToIconMap).map(([keyword, icon]) => (
              <SelectItem key={keyword} value={icon}>
                {keyword}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="isSubmenu">È un sottomenu?</Label>
        <Switch
          id="isSubmenu"
          checked={isSubmenu}
          onCheckedChange={(checked) => setIsSubmenu(checked)}
        />
      </div>
      
      {isSubmenu && (
        <div>
          <Label htmlFor="parentPath">Percorso del menu principale</Label>
          <Select value={parentPath} onValueChange={setParentPath}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona un percorso principale" />
            </SelectTrigger>
            <SelectContent>
              {parentPages.map((parentPage) => (
                <SelectItem key={parentPage.path} value={parentPage.path}>
                  {parentPage.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label>Contenuto</Label>
        <Textarea 
          value={editorState}
          onChange={(e) => setEditorState(e.target.value)}
          className="min-h-[300px]"
          placeholder="Inserisci il contenuto della pagina..."
        />
      </div>
      
      <div>
        <Label>Immagini</Label>
        {pageImages.map((img, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`image-url-${index}`}>URL Immagine</Label>
                <Input
                  type="text"
                  id={`image-url-${index}`}
                  value={img.url}
                  onChange={(e) => {
                    const newImages = [...pageImages];
                    newImages[index].url = e.target.value;
                    setPageImages(newImages);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`image-position-${index}`}>Posizione</Label>
                <Select
                  value={img.position}
                  onValueChange={(value) => {
                    const newImages = [...pageImages];
                    newImages[index].position = value as "left" | "center" | "right" | "full";
                    setPageImages(newImages);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona la posizione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Sinistra</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Destra</SelectItem>
                    <SelectItem value="full">Larghezza Intera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`image-caption-${index}`}>Didascalia</Label>
                <Input
                  type="text"
                  id={`image-caption-${index}`}
                  value={img.caption || ''}
                  onChange={(e) => {
                    const newImages = [...pageImages];
                    newImages[index].caption = e.target.value;
                    setPageImages(newImages);
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => {
                const newImages = pageImages.filter((_, i) => i !== index);
                setPageImages(newImages);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rimuovi
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => {
          setPageImages([...pageImages, { url: '', position: 'center', caption: '', type: 'image' }]);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Immagine
        </Button>
      </div>
      
      <div>
        <Label htmlFor="listType">Tipo di Lista</Label>
        <Select value={listType} onValueChange={(value) => setListType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona un tipo di lista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurants">Ristoranti</SelectItem>
            <SelectItem value="activities">Attività</SelectItem>
            <SelectItem value="locations">Luoghi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Aggiornamento..." : "Aggiorna Pagina"}
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={onFormClose}>
            Annulla
          </Button>
        </DialogClose>
      </div>
    </form>
  );
};
