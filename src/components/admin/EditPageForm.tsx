
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { PageContentSection } from "./form/PageContentSection";
import { PageTypeSection } from "./form/PageTypeSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageIconSection } from "./form/PageIconSection";

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
  const [path, setPath] = useState(page.path); // Keep state but hide UI element
  const [isSubmenu, setIsSubmenu] = useState(page.isSubmenu || false);
  const [parentPath, setParentPath] = useState(page.parentPath || "");
  const [imageUrl, setImageUrl] = useState(page.imageUrl || "");
  const [icon, setIcon] = useState(page.icon || "FileText");
  const [isLoading, setIsLoading] = useState(false);

  const [listItems, setListItems] = useState(page.listItems || []);
  const [listType, setListType] = useState(page.listType || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (!title.trim()) {
        toast.error("Il titolo è obbligatorio");
        return;
      }
      
      if (!content.trim()) {
        toast.error("Il contenuto è obbligatorio");
        return;
      }
      
      // We still validate the path even though it's hidden
      if (!path.trim()) {
        toast.error("Il percorso è obbligatorio");
        return;
      }
      
      if (isSubmenu && !parentPath) {
        toast.error("Seleziona una pagina genitore");
        return;
      }
      
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
      <div className="space-y-2">
        <Label htmlFor="title">Titolo</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Titolo della pagina"
        />
      </div>
      
      <PageContentSection content={content} setContent={setContent} />
      
      <PageTypeSection 
        isSubmenu={isSubmenu}
        setIsSubmenu={setIsSubmenu}
        parentPath={parentPath}
        setParentPath={setParentPath}
        parentPages={parentPages}
      />
      
      <PageImageSection 
        imageUrl={imageUrl}
        onImageUploaded={handleImageUploaded}
      />
      
      <PageIconSection 
        icon={icon}
        setIcon={setIcon}
      />
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Aggiornamento in corso..." : "Aggiorna pagina"}
      </Button>
    </form>
  );
};
