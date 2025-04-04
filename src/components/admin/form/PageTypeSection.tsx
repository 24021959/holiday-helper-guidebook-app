
import React from "react";
import { Label } from "@/components/ui/label";
import { PageData } from "@/pages/Admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  );
};
