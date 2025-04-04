
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageData } from "@/pages/Admin";
import { ImageUploader } from "../ImageUploader";

interface EditPageFormProps {
  page: PageData;
  parentPages: PageData[];
  onPageUpdated: (updatedPage: PageData) => void;
  keywordToIconMap: Record<string, string>;
}

export const EditPageForm: React.FC<EditPageFormProps> = ({
  page,
  parentPages,
  onPageUpdated,
  keywordToIconMap
}) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [path, setPath] = useState(page.path);
  const [isSubmenu, setIsSubmenu] = useState(page.isSubmenu || false);
  const [parentPath, setParentPath] = useState(page.parentPath || "");
  const [imageUrl, setImageUrl] = useState(page.imageUrl || "");
  const [icon, setIcon] = useState(page.icon || "FileText");
  const [isLoading, setIsLoading] = useState(false);

  // If it's a list page, handle the list items
  const [listItems, setListItems] = useState(page.listItems || []);
  const [listType, setListType] = useState(page.listType || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate form
      if (!title.trim()) {
        toast.error("Il titolo è obbligatorio");
        return;
      }
      
      if (!content.trim()) {
        toast.error("Il contenuto è obbligatorio");
        return;
      }
      
      if (!path.trim()) {
        toast.error("Il percorso è obbligatorio");
        return;
      }
      
      // If it's a submenu, validate parent path
      if (isSubmenu && !parentPath) {
        toast.error("Seleziona una pagina genitore");
        return;
      }
      
      // Update page in Supabase
      const { data, error } = await supabase
        .from('custom_pages')
        .update({
          title,
          content,
          path,
          is_submenu: isSubmenu,
          parent_path: isSubmenu ? parentPath : null,
          image_url: imageUrl,
          icon,
          list_items: listItems,
          list_type: listType || null
        })
        .eq('id', page.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Update menu icon
      await supabase
        .from('menu_icons')
        .update({
          label: title,
          icon,
          path,
          is_submenu: isSubmenu,
          parent_path: isSubmenu ? parentPath : null
        })
        .eq('path', page.path);
      
      // Format the updated page
      const updatedPage: PageData = {
        id: data.id,
        title: data.title,
        content: data.content,
        path: data.path,
        imageUrl: data.image_url,
        icon: data.icon,
        isSubmenu: data.is_submenu,
        parentPath: data.parent_path,
        listItems: Array.isArray(data.list_items) ? data.list_items : [],
        listType: data.list_type as 'restaurants' | 'activities' | 'locations' | undefined
      };
      
      // Call callback function
      onPageUpdated(updatedPage);
      
      toast.success("Pagina aggiornata con successo");
    } catch (error) {
      console.error("Errore nell'aggiornamento della pagina:", error);
      toast.error("Errore nell'aggiornamento della pagina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titolo</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Titolo della pagina"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="path">Percorso URL</Label>
          <Input 
            id="path" 
            value={path} 
            onChange={(e) => setPath(e.target.value)} 
            placeholder="percorso-pagina"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Contenuto</Label>
        <Textarea 
          id="content" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Contenuto della pagina"
          className="min-h-[200px]"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo di pagina</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSubmenu"
              checked={isSubmenu}
              onChange={(e) => setIsSubmenu(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isSubmenu">Sottopagina</Label>
          </div>
        </div>
        
        {isSubmenu && (
          <div className="space-y-2">
            <Label htmlFor="parentPath">Pagina genitore</Label>
            <Select 
              value={parentPath} 
              onValueChange={setParentPath}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona pagina genitore" />
              </SelectTrigger>
              <SelectContent>
                {parentPages.map((parent) => (
                  <SelectItem key={parent.path} value={parent.path}>
                    {parent.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Immagine della pagina</Label>
        <div className="space-y-2">
          {imageUrl && (
            <div className="mb-2">
              <img 
                src={imageUrl} 
                alt="Anteprima" 
                className="w-full max-h-32 object-cover rounded-md"
              />
            </div>
          )}
          <ImageUploader onImageUploaded={handleImageUploaded} />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="icon">Icona</Label>
        <Select 
          value={icon} 
          onValueChange={setIcon}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona un'icona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FileText">Documento</SelectItem>
            <SelectItem value="Image">Immagine</SelectItem>
            <SelectItem value="MessageCircle">Messaggio</SelectItem>
            <SelectItem value="Info">Informazioni</SelectItem>
            <SelectItem value="Map">Mappa</SelectItem>
            <SelectItem value="Utensils">Ristorante</SelectItem>
            <SelectItem value="Landmark">Luogo</SelectItem>
            <SelectItem value="Hotel">Hotel</SelectItem>
            <SelectItem value="Wifi">WiFi</SelectItem>
            <SelectItem value="Bus">Trasporti</SelectItem>
            <SelectItem value="ShoppingBag">Shopping</SelectItem>
            <SelectItem value="Calendar">Eventi</SelectItem>
            <SelectItem value="Phone">Contatti</SelectItem>
            <SelectItem value="Book">Guida</SelectItem>
            <SelectItem value="Coffee">Bar</SelectItem>
            <SelectItem value="Home">Casa</SelectItem>
            <SelectItem value="Bike">Attività</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Aggiornamento in corso..." : "Aggiorna pagina"}
      </Button>
    </form>
  );
};
