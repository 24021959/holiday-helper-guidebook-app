
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageData } from "@/types/page.types";
import { Control } from "react-hook-form";
import { FormDescription } from "@/components/ui/form";

interface PageTypeSectionProps {
  pageType: "normal" | "submenu" | "parent";
  setPageType: (type: "normal" | "submenu" | "parent") => void;
  parentPath: string;
  setParentPath: (path: string) => void;
  parentPages: PageData[];
  control: Control<any>;
}

export const PageTypeSection: React.FC<PageTypeSectionProps> = ({
  pageType,
  setPageType,
  parentPath,
  setParentPath,
  parentPages,
  control
}) => {
  return (
    <>
      <FormField
        control={control}
        name="pageType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di Pagina</FormLabel>
            <Select
              onValueChange={(value) => {
                setPageType(value as "normal" | "submenu" | "parent");
                field.onChange(value);
              }}
              defaultValue={pageType}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="submenu">Sottomenu</SelectItem>
                <SelectItem value="parent">Pagina Master</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Seleziona il tipo di pagina che stai creando.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {pageType === "submenu" && (
        <FormField
          control={control}
          name="parentPage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pagina Genitore</FormLabel>
              <Select
                onValueChange={(value) => {
                  setParentPath(value);
                  field.onChange(value);
                }}
                defaultValue={parentPath}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona la pagina genitore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentPages.map((page) => (
                    <SelectItem key={page.path} value={page.path}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Seleziona la pagina genitore per questo sottomenu.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {pageType === "parent" && (
        <FormField
          control={control}
          name="parentPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percorso della Pagina Master</FormLabel>
              <FormControl>
                <input 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="es. /it/pagina-master" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Questo sarà il percorso URL della tua pagina master
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
