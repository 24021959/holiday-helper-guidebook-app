import React, { useState, useEffect } from "react";
import { z } from "zod";
import { PageData } from "@/context/AdminContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IconPicker } from "@/components/admin/IconPicker";
import { IconRenderer } from "@/components/IconRenderer";
import { PageTypeSection } from "@/components/admin/form/PageTypeSection";
import { ListItemsEditor } from "@/components/admin/form/ListItemsEditor";
import { ImageUploader } from "@/components/admin/form/ImageUploader";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Il titolo deve essere di almeno 2 caratteri.",
  }),
  content: z.string().optional(),
  path: z.string().min(2, {
    message: "Il percorso deve essere di almeno 2 caratteri.",
  }),
  imageUrl: z.string().optional(),
  icon: z.string().optional(),
  listType: z.enum(["locations", "activities", "restaurants"]).optional(),
  listItems: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      phoneNumber: z.string().optional(),
      mapsUrl: z.string().optional(),
    })
  ).optional(),
  isSubmenu: z.boolean().default(false),
  parentPath: z.string().optional(),
  published: z.boolean().default(false),
  is_parent: z.boolean().default(false),
});

interface EditPageFormProps {
  page: PageData;
  parentPages: PageData[];
  keywordToIconMap: Record<string, string>;
  onUpdate: (updatedPage: PageData) => void;
}

const EditPageForm: React.FC<EditPageFormProps> = ({ page, parentPages, keywordToIconMap, onUpdate }) => {
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(page.icon);
  const [isSubmenu, setIsSubmenu] = useState<boolean>(page.isSubmenu);
  const [published, setPublished] = useState<boolean>(page.published);
  const [isParent, setIsParent] = useState<boolean>(page.is_parent);
  const [imageUrl, setImageUrl] = useState<string | undefined>(page.imageUrl);
  const [listItems, setListItems] = useState(page.listItems || []);
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants" | undefined>(page.listType);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page.title,
      content: page.content,
      path: page.path,
      imageUrl: page.imageUrl,
      icon: page.icon,
      listType: page.listType,
      listItems: page.listItems,
      isSubmenu: page.isSubmenu,
      parentPath: page.parentPath || undefined,
      published: page.published,
      is_parent: page.is_parent
    },
  });

  useEffect(() => {
    form.reset({
      title: page.title,
      content: page.content,
      path: page.path,
      imageUrl: page.imageUrl,
      icon: page.icon,
      listType: page.listType,
      listItems: page.listItems,
      isSubmenu: page.isSubmenu,
      parentPath: page.parentPath || undefined,
      published: page.published,
      is_parent: page.is_parent
    });
    setSelectedIcon(page.icon);
    setIsSubmenu(page.isSubmenu);
    setPublished(page.published);
    setIsParent(page.is_parent);
    setImageUrl(page.imageUrl);
    setListItems(page.listItems || []);
    setListType(page.listType);
  }, [page]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .update({
          title: values.title,
          content: values.content,
          path: values.path,
          image_url: imageUrl || null,
          icon: selectedIcon || null,
          list_type: listType || null,
          list_items: listItems.length > 0 ? listItems : null,
          is_submenu: isSubmenu,
          parent_path: values.parentPath || null,
          published: published,
          is_parent: isParent
        })
        .eq('id', page.id);

      if (error) {
        console.error("Errore durante l'aggiornamento della pagina:", error);
        toast.error("Errore durante l'aggiornamento della pagina");
        return;
      }

      toast.success("Pagina aggiornata con successo!");

      const updatedPage: PageData = {
        ...page,
        title: values.title,
        content: values.content,
        path: values.path,
        imageUrl: imageUrl || null,
        icon: selectedIcon || undefined,
        listType: listType,
        listItems: listItems,
        isSubmenu: isSubmenu,
        parentPath: values.parentPath || null,
        pageImages: [],
        published: published,
        is_parent: isParent
      };

      onUpdate(updatedPage);
    } catch (error: any) {
      console.error("Si è verificato un errore durante l'aggiornamento della pagina:", error);
      toast.error("Si è verificato un errore durante l'aggiornamento della pagina");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input placeholder="Titolo della pagina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percorso</FormLabel>
              <FormControl>
                <Input placeholder="Percorso della pagina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenuto</FormLabel>
              <FormControl>
                <Textarea placeholder="Contenuto della pagina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ImageUploader imageUrl={imageUrl} setImageUrl={setImageUrl} />

        <div className="flex items-center space-x-2">
          <Label htmlFor="isSubmenu">È un sottomenu?</Label>
          <Switch
            id="isSubmenu"
            checked={isSubmenu}
            onCheckedChange={(checked) => {
              setIsSubmenu(checked);
              form.setValue("isSubmenu", checked);
            }}
          />
        </div>

        {isSubmenu && (
          <FormField
            control={form.control}
            name="parentPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pagina Genitore</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={page.parentPath || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una pagina genitore" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentPages.map((parentPage) => (
                      <SelectItem key={parentPage.id} value={parentPage.path}>
                        {parentPage.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <PageTypeSection
          form={form}
          listType={listType}
          setListType={setListType}
        />

        {listType && (
          <ListItemsEditor listItems={listItems} setListItems={setListItems} />
        )}

        <div className="flex items-center space-x-2">
          <Label htmlFor="published">Pubblicata</Label>
          <Switch
            id="published"
            checked={published}
            onCheckedChange={(checked) => {
              setPublished(checked);
              form.setValue("published", checked);
            }}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="is_parent">È una pagina genitore?</Label>
          <Switch
            id="is_parent"
            checked={isParent}
            onCheckedChange={(checked) => {
              setIsParent(checked);
              form.setValue("is_parent", checked);
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="icon"
          render={() => (
            <FormItem>
              <FormLabel>Icona</FormLabel>
              <FormControl>
                <IconPicker
                  selectedIcon={selectedIcon}
                  onIconSelect={(icon) => {
                    setSelectedIcon(icon);
                    form.setValue("icon", icon);
                  }}
                  keywordToIconMap={keywordToIconMap}
                />
              </FormControl>
              {selectedIcon && (
                <div className="mt-2">
                  Icona Selezionata:
                  <IconRenderer iconName={selectedIcon} className="h-5 w-5 inline-block mx-1" />
                  ({selectedIcon})
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Aggiorna Pagina</Button>
      </form>
    </Form>
  );
};

export default EditPageForm;
