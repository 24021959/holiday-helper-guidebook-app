
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye } from "lucide-react";

interface PageListItemProps {
  page: PageData;
  onDelete: (id: string) => void;
  onEdit: (page: PageData) => void;
  onPreview: (path: string) => void;
}

export const PageListItem: React.FC<PageListItemProps> = ({ 
  page, 
  onDelete, 
  onEdit, 
  onPreview
}) => {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{page.title}</h3>
              <p className="text-sm text-gray-500">
                {page.isSubmenu ? 'Sottomenu' : 'Pagina principale'} - {page.path}
              </p>
            </div>
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
                    Sei sicuro di voler eliminare questa pagina? Questa azione non può essere annullata.
                    {!page.isSubmenu && " Verranno eliminate anche tutte le sottopagine."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(page.id)}>
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
