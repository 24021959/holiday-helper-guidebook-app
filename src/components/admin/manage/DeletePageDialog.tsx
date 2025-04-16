
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageData } from "@/types/page.types";
import { languages } from "./LanguageSelector";

interface DeletePageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  page: PageData | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
}

export const DeletePageDialog = ({ 
  isOpen, 
  onOpenChange, 
  page, 
  isDeleting, 
  onConfirm 
}: DeletePageDialogProps) => {
  const getLanguageLabel = (langCode: string): string => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? `${lang.flag} ${lang.name}` : langCode;
  };

  const getLanguageFromPath = (path: string): string => {
    const match = path.match(/^\/([a-z]{2})\//);
    return match ? match[1] : 'it';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            {!page ? "Caricamento..." : page.path.match(/^\/[a-z]{2}\//) 
              ? `Sei sicuro di voler eliminare questa pagina tradotta in ${getLanguageLabel(getLanguageFromPath(page.path))}? L'azione non può essere annullata.`
              : "Sei sicuro di voler eliminare questa pagina italiana e TUTTE le sue traduzioni? L'azione non può essere annullata e rimuoverà la pagina in tutte le lingue."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminazione in corso..." : "Elimina"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
