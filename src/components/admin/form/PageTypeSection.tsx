
import React from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageData } from "@/context/AdminContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface PageTypeSectionProps {
  pageType: "normal" | "submenu" | "parent";
  setPageType: (pageType: "normal" | "submenu" | "parent") => void;
  parentPath: string;
  setParentPath: (parentPath: string) => void;
  parentPages: PageData[];
}

export const PageTypeSection: React.FC<PageTypeSectionProps> = ({
  pageType,
  setPageType,
  parentPath,
  setParentPath,
  parentPages
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo di pagina</Label>
        <RadioGroup 
          value={pageType} 
          onValueChange={(value) => setPageType(value as "normal" | "submenu" | "parent")} 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md">
            <RadioGroupItem value="normal" id="normal" />
            <Label htmlFor="normal" className="cursor-pointer">Pagina normale</Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md">
            <RadioGroupItem value="submenu" id="submenu" />
            <Label htmlFor="submenu" className="cursor-pointer">Sottopagina</Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md">
            <RadioGroupItem value="parent" id="parent" />
            <Label htmlFor="parent" className="cursor-pointer">Pagina genitore</Label>
          </div>
        </RadioGroup>
      </div>
      
      {(pageType === "submenu") && (
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
                <strong>Pagina genitore:</strong> Questa pagina non ha contenuti propri e serve solo come contenitore per sottopagine. Cliccandola si aprirà un sottomenu con le sue sottopagine.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
