
import React from "react";
import { Label } from "@/components/ui/label";
import { PageData } from "@/pages/Admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface PageTypeSectionProps {
  isSubmenu: boolean;
  setIsSubmenu: (isSubmenu: boolean) => void;
  parentPath: string;
  setParentPath: (parentPath: string) => void;
  parentPages: PageData[];
}

export const PageTypeSection: React.FC<PageTypeSectionProps> = ({
  isSubmenu,
  setIsSubmenu,
  parentPath,
  setParentPath,
  parentPages
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo di pagina</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSubmenu"
              checked={isSubmenu}
              onChange={(e) => setIsSubmenu(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isSubmenu">Sottopagina</Label>
          </div>
        </div>
        
        {isSubmenu && (
          <div className="space-y-2">
            <Label htmlFor="parentPath">Pagina genitore</Label>
            <Select 
              value={parentPath} 
              onValueChange={setParentPath}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona pagina genitore" />
              </SelectTrigger>
              <SelectContent>
                {parentPages.map((parent) => (
                  <SelectItem key={parent.path} value={parent.path}>
                    {parent.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex space-x-2">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700">Informazioni sui tipi di pagina:</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-600 list-disc pl-5">
              <li>
                <strong>Pagina normale:</strong> Una pagina che mostra il suo contenuto quando viene cliccata.
              </li>
              <li>
                <strong>Sottopagina:</strong> Una pagina che appare nel menu di una pagina genitore.
              </li>
              <li>
                <strong>Pagina genitore:</strong> Quando una pagina ha delle sottopagine, cliccandola apparirà un sottomenu invece del contenuto della pagina.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
