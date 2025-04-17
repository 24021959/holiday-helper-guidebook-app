
import React from "react";
import { PageData } from "@/types/page.types";
import { PageTypeBadge } from "./PageTypeBadge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PagesListProps {
  pages: PageData[];
  onView: (page: PageData) => void;
  onDelete: (page: PageData) => void;
  onEdit: (page: PageData) => void;
  isDeleting: boolean;
}

export const PagesList: React.FC<PagesListProps> = ({
  pages,
  onView,
  onDelete,
  onEdit,
  isDeleting
}) => {
  // If there are no pages, show a helpful message
  if (pages.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-gray-500 mb-2">
              Nessuna pagina trovata per questa lingua
            </p>
            <p className="text-sm text-gray-400">
              Crea una nuova pagina o cambia la lingua selezionata
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <Card key={page.id} className="overflow-hidden">
          <CardHeader className="p-4 bg-gray-50 flex flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium">{page.title}</h3>
              <PageTypeBadge 
                isParent={!!page.is_parent} 
                isSubmenu={!!page.isSubmenu} 
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(page)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                aria-label={`Visualizza ${page.title}`}
              >
                <Eye className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Visualizza</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(page)}
                className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                aria-label={`Modifica ${page.title}`}
              >
                <Pencil className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Modifica</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(page)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                aria-label={`Elimina ${page.title}`}
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Elimina</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500 mb-1">Percorso:</div>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{page.path}</code>
                {page.parentPath && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-500 mb-1">Percorso del genitore:</div>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{page.parentPath}</code>
                  </div>
                )}
              </div>
              <div>
                {page.imageUrl && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Immagine:</div>
                    <img 
                      src={page.imageUrl} 
                      alt={`Immagine per ${page.title}`} 
                      className="h-20 object-cover rounded border border-gray-200" 
                    />
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="line-clamp-3 text-sm text-gray-600">
              {page.content ? (
                page.content.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...'
              ) : (
                <span className="italic text-gray-400">Nessun contenuto</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
