import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/types/page.types";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
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

const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const AdminManage = ({ onEditPage }: { onEditPage: (page: PageData) => void }) => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingPage, setDeletingPage] = useState<PageData | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('it');

  const fetchPages = async (langCode: string) => {
    try {
      setIsLoading(true);
      let query = supabase.from('custom_pages').select('*');
      
      if (langCode === 'it') {
        query = query.or(`path.not.like./%/%, path.like./it/%`);
      } else {
        query = query.like('path', `/${langCode}/%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        console.log(`Fetched ${data.length} pages for language: ${langCode}`, data);
        
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
    fetchPages(currentLanguage);
  }, [currentLanguage]);

  const handleView = (page: PageData) => {
    window.open(`/preview${page.path}`, '_blank');
  };

  const handleEdit = (page: PageData) => {
    onEditPage(page);
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestione Pagine</h2>
        <div className="flex gap-2 mb-6">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={currentLanguage === lang.code ? "default" : "outline"}
              onClick={() => setCurrentLanguage(lang.code)}
              className={currentLanguage === lang.code ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </Button>
          ))}
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nessuna pagina trovata per questa lingua</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">
                  {page.title}
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
      )}

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
    </div>
  );
};

export default AdminManage;
