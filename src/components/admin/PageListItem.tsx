
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye } from "lucide-react";

interface PageListItemProps {
  page: PageData;
  translations: PageData[];
  onDelete: (page: PageData) => void;
  onEdit: (page: PageData) => void;
  onPreview: (path: string) => void;
}

// Determina la lingua da un percorso
const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

export const PageListItem: React.FC<PageListItemProps> = ({ 
  page, 
  translations,
  onDelete, 
  onEdit, 
  onPreview
}) => {
  // Determina la lingua della pagina corrente
  const currentLanguage = getLanguageFromPath(page.path);
  const hasTranslations = translations.length > 1;
  
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-medium">{page.title}</h3>
            <p className="text-sm text-gray-500">
              {page.isSubmenu ? 'Sottomenu' : page.is_parent ? 'Pagina genitore' : 'Pagina normale'} - {page.path}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-600">
            {hasTranslations ? `${translations.length} versioni linguistiche` : 'Solo versione principale'}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPreview(page.path)}
              title="Anteprima"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(page)}
              title="Modifica"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  title="Elimina"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare questa pagina e tutte le sue traduzioni? 
                    Questa azione eliminerà {translations.length} pagine e non può essere annullata.
                    {!page.isSubmenu && " Verranno eliminate anche tutte le sottopagine."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(page)}>
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
