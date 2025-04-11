import React, { useState } from "react";
import { FileText, Pencil, Trash2, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/context/AdminContext";
import { IconRenderer } from "@/components/IconRenderer";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PageListItemProps {
  page: PageData;
  onDelete: (id: string) => void;
  onUpdate: (updatedPage: PageData) => void;
  keywordToIconMap: Record<string, string>;
}

const PageListItem: React.FC<PageListItemProps> = ({ page, onDelete, onUpdate, keywordToIconMap }) => {
  const [isPublished, setIsPublished] = useState(page.published);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm(`Sei sicuro di voler eliminare la pagina "${page.title}"?`)) {
      return;
    }

    try {
      await supabase
        .from('custom_pages')
        .delete()
        .eq('id', page.id);

      onDelete(page.id);
      toast.success("Pagina eliminata con successo!");
    } catch (error: any) {
      console.error("Errore durante l'eliminazione della pagina:", error);
      toast.error("Errore durante l'eliminazione della pagina.");
    }
  };

  const handleDuplicate = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .insert({
          title: `${page.title} - Copia`,
          content: page.content,
          path: `${page.path}-copia`,
          image_url: page.imageUrl,
          icon: page.icon,
          list_type: page.listType,
          list_items: page.listItems,
          is_submenu: page.isSubmenu,
          parent_path: page.parentPath,
          published: page.published
        })
        .select()

      if (error) {
        console.error("Errore durante la duplicazione della pagina:", error);
        toast.error("Errore durante la duplicazione della pagina.");
        return;
      }

      toast.success("Pagina duplicata con successo!");
      window.location.reload();
    } catch (error: any) {
      console.error("Errore durante la duplicazione della pagina:", error);
      toast.error("Errore durante la duplicazione della pagina.");
    }
  };

  const handleTogglePublish = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .update({ published: !isPublished })
        .eq('id', page.id)
        .select();

      if (error) {
        console.error("Errore durante l'aggiornamento dello stato di pubblicazione:", error);
        toast.error("Errore durante l'aggiornamento dello stato di pubblicazione.");
        return;
      }

      setIsPublished(!isPublished);
      onUpdate({ ...page, published: !isPublished });
      toast.success(`Pagina ${isPublished ? 'non pubblicata' : 'pubblicata'} con successo!`);
    } catch (error: any) {
      console.error("Errore durante l'aggiornamento dello stato di pubblicazione:", error);
      toast.error("Errore durante l'aggiornamento dello stato di pubblicazione.");
    }
  };

  return (
    <li key={page.id} className="py-2 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {page.icon && (
            <IconRenderer iconName={page.icon} className="mr-2 h-5 w-5" />
          )}
          {!page.icon && page.listType && keywordToIconMap[page.listType] && (
            <IconRenderer iconName={keywordToIconMap[page.listType]} className="mr-2 h-5 w-5" />
          )}
          <span className="text-base font-medium text-gray-800">{page.title}</span>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/preview/${page.path}`)}
            title="Anteprima"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/admin?edit=${page.id}`)}
            title="Modifica"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDuplicate}
            title="Duplica"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleTogglePublish}
            title={isPublished ? "Rendi non pubblico" : "Pubblica"}
            className={isPublished ? "text-yellow-500 hover:text-yellow-600" : "text-green-500 hover:text-green-600"}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            title="Elimina"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default PageListItem;
