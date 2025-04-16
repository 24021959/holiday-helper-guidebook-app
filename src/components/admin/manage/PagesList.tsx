
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
import { Eye, Trash2, Pencil } from "lucide-react";
import { PageTypeBadge } from "./PageTypeBadge";

interface PagesListProps {
  pages: PageData[];
  onView: (page: PageData) => void;
  onDelete: (page: PageData) => void;
  onEdit: (page: PageData) => void;
  isDeleting: boolean;
}

export const PagesList = ({ pages, onView, onDelete, onEdit, isDeleting }: PagesListProps) => {
  if (pages.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nessuna pagina trovata per questa lingua</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titolo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => (
          <TableRow key={page.id}>
            <TableCell className="font-medium">
              {page.title}
            </TableCell>
            <TableCell>
              <PageTypeBadge isParent={page.is_parent} isSubmenu={page.isSubmenu} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(page)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onView(page)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(page)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
