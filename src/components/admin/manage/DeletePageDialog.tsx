
import React from "react";
import { PageData } from "@/types/page.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeletePageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  page: PageData | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
}

export const DeletePageDialog: React.FC<DeletePageDialogProps> = ({
  isOpen,
  onOpenChange,
  page,
  isDeleting,
  onConfirm
}) => {
  if (!page) return null;

  const isTranslation = page.path.match(/^\/[a-z]{2}\//);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Conferma eliminazione</span>
          </DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare la pagina <strong>{page.title}</strong>?
            <br />
            {isTranslation ? 
              "Verrà eliminata solo questa traduzione." :
              "Verranno eliminate anche tutte le traduzioni associate."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
            <p>Questa azione non può essere annullata.</p>
            {page.path === "/home" && (
              <p className="mt-2 font-semibold">
                Attenzione: stai eliminando la pagina home principale!
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annulla
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminazione..." : "Elimina"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
