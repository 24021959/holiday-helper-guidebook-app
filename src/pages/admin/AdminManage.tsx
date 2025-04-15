
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/types/admin.types";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Languages } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import EditPageForm from "@/components/admin/EditPageForm";
import { LanguageFlags } from "@/components/admin/LanguageFlags";

const AdminManage = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingPage, setDeletingPage] = useState<PageData | null>(null);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .or('path.not.ilike.%/en%,path.not.ilike.%/fr%,path.not.ilike.%/es%,path.not.ilike.%/de%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPages = data.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined,
          pageImages: [],
          published: page.published,
          is_parent: false
        }));
        setPages(formattedPages);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Errore nel caricamento delle pagine");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleView = (page: PageData) => {
    window.open(`/preview${page.path}`, '_blank');
  };

  const handleEdit = (page: PageData) => {
    setSelectedPage(page);
    setShowEditDialog(true);
  };

  const handleDelete = async (page: PageData) => {
    setDeletingPage(page);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingPage) return;

    try {
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', deletingPage.id);

      if (pageError) throw pageError;

      const { error: menuError } = await supabase
        .from('menu_icons')
        .delete()
        .eq('path', deletingPage.path);

      if (menuError) {
        console.error("Error deleting menu icon:", menuError);
      }

      setPages(prev => prev.filter(p => p.id !== deletingPage.id));
      toast.success("Pagina eliminata con successo");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Errore nell'eliminazione della pagina");
    } finally {
      setShowDeleteDialog(false);
      setDeletingPage(null);
    }
  };

  const onPageUpdated = (updatedPages: PageData[]) => {
    setPages(updatedPages.filter(page => 
      !page.path.includes('/en/') && 
      !page.path.includes('/fr/') && 
      !page.path.includes('/es/') && 
      !page.path.includes('/de/')
    ));
    setShowEditDialog(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Gestione Pagine</h2>
        <p className="text-gray-600">Gestisci le pagine del tuo sito</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Percorso</TableHead>
            <TableHead>Traduzioni</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell>{page.path}</TableCell>
              <TableCell>
                <LanguageFlags path={page.path} />
              </TableCell>
              <TableCell>
                <Badge 
                  variant={page.published ? "default" : "secondary"}
                  className={page.published ? "bg-emerald-100 text-emerald-800" : ""}
                >
                  {page.published ? "Pubblicata" : "Bozza"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleView(page)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(page)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(page)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa pagina? L'azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showEditDialog && selectedPage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              className="absolute right-4 top-4"
              onClick={() => setShowEditDialog(false)}
            >
              ✕
            </Button>
            <EditPageForm
              selectedPage={selectedPage}
              parentPages={pages.filter(p => p.is_parent)}
              onPageUpdated={onPageUpdated}
              keywordToIconMap={{}}
              allPages={pages}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManage;
