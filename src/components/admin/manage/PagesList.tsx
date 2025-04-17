
import React from "react";
import { PageData } from "@/types/page.types";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  // Se non ci sono pagine, mostra un messaggio informativo
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
      {pages.map((page) => {
        const isHomePage = page.path === "/" || page.path.endsWith("/home");
        
        return (
          <Card key={page.id} className="overflow-hidden">
            <CardHeader className="p-4 bg-gray-50 flex flex-row justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{page.title}</h3>
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
                {!isHomePage && (
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
                )}
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

