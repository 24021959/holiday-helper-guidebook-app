
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { PageData } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CreatePageForm from "./CreatePageForm";
import PageListItem from "./PageListItem";

interface ManagePagesViewProps {
  pages: PageData[];
  onPagesUpdate: (updatedPages: PageData[]) => void;
  parentPages: PageData[];
  keywordToIconMap: Record<string, string>;
}

const ManagePagesView: React.FC<ManagePagesViewProps> = ({
  pages,
  onPagesUpdate,
  parentPages,
  keywordToIconMap,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestione Pagine</h2>
         <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Nuova Pagina
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Crea una Nuova Pagina</DialogTitle>
          <CreatePageForm
            onPageCreate={(newPage: PageData) => {
              onPagesUpdate([...pages, newPage]);
              setOpen(false);
            }}
            parentPages={parentPages}
            keywordToIconMap={keywordToIconMap}
          />
        </DialogContent>
      </Dialog>

      {pages.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {pages.map((page) => (
            <PageListItem
              key={page.id}
              page={page}
              onUpdate={(updatedPage: PageData) => {
                const updatedPages = pages.map((p) =>
                  p.id === updatedPage.id ? updatedPage : p
                );
                onPagesUpdate(updatedPages);
              }}
              onDelete={(id: string) => {
                const updatedPages = pages.filter((p) => p.id !== id);
                onPagesUpdate(updatedPages);
              }}
              parentPages={parentPages}
              keywordToIconMap={keywordToIconMap}
            />
          ))}
        </div>
      ) : (
        <p>Nessuna pagina trovata.</p>
      )}
    </div>
  );
};

export default ManagePagesView;
