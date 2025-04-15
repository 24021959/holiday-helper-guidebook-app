
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageData } from "@/types/page.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PageTypeSectionProps {
  pageType: "normal" | "submenu" | "parent";
  setPageType: (type: "normal" | "submenu" | "parent") => void;
  parentPath: string;
  setParentPath: (path: string) => void;
  parentPages: PageData[];
  control?: any;
}

export const PageTypeSection: React.FC<PageTypeSectionProps> = ({
  pageType,
  setPageType,
  parentPath,
  setParentPath,
  parentPages,
  control
}) => {
  // Filter for Italian parent pages only (no language prefix and is_parent true)
  const filteredParentPages = parentPages.filter(page => {
    // Check if the page has no language prefix (which means it's an Italian page)
    const isItalianPage = !page.path.startsWith('/en/') && 
                          !page.path.startsWith('/de/') && 
                          !page.path.startsWith('/fr/') && 
                          !page.path.startsWith('/es/');
    
    // Check if it's a parent page
    const isParentPage = page.is_parent;
    
    return isItalianPage && isParentPage;
  });

  console.log("Parent pages before filtering:", parentPages);
  console.log("Filtered parent pages:", filteredParentPages);

  return (
    <>
      <FormField
        control={control}
        name="pageType"
        render={() => (
          <FormItem>
            <FormLabel>Tipo di Pagina</FormLabel>
            <Select
              onValueChange={(value) => setPageType(value as "normal" | "submenu" | "parent")}
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
                <SelectItem value="parent">Pagina Genitore</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {pageType === "submenu" && (
        <FormField
          control={control}
          name="parentPage"
          render={() => (
            <FormItem>
              <FormLabel>Pagina Genitore</FormLabel>
              <Select
                onValueChange={setParentPath}
                defaultValue={parentPath}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona la pagina genitore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px] overflow-auto">
                  {filteredParentPages.length > 0 ? (
                    filteredParentPages.map((page) => (
                      <SelectItem key={page.path} value={page.path}>
                        {page.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nessuna pagina genitore disponibile
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Seleziona una pagina genitore italiana
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
              <FormLabel>Percorso della Pagina Genitore</FormLabel>
              <FormControl>
                <Input placeholder="es. /pagina-genitore" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
