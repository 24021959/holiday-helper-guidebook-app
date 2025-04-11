
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { PageData } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/Icons";
import ImageUploader from "./ImageUploader";
import { PageTypeSection } from "./form/PageTypeSection";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Il titolo deve essere di almeno 2 caratteri.",
  }),
  path: z.string().min(2, {
    message: "Il percorso deve essere di almeno 2 caratteri.",
  }),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  icon: z.string().optional(),
  listType: z.enum(["locations", "activities", "restaurants"]).optional(),
  isSubmenu: z.boolean().default(false).optional(),
  parentPath: z.string().optional(),
  published: z.boolean().default(false).optional(),
  is_parent: z.boolean().default(false).optional(),
});

interface CreatePageFormProps {
  onPageCreate: (newPage: PageData) => void;
  parentPages: PageData[];
  keywordToIconMap: Record<string, string>;
}

const CreatePageForm: React.FC<CreatePageFormProps> = ({ onPageCreate, parentPages, keywordToIconMap }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pageType, setPageType] = useState<"normal" | "submenu" | "parent">("normal");
  const [parentPath, setParentPath] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      path: "",
      imageUrl: "",
      icon: "",
      listType: undefined,
      isSubmenu: false,
      parentPath: undefined,
      published: false,
      is_parent: false
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    try {
      const newPageId = uuidv4();
      const { data, error } = await supabase
        .from('custom_pages')
        .insert([
          {
            id: newPageId,
            title: values.title,
            content: values.content,
            path: values.path,
            image_url: selectedImage || values.imageUrl || null,
            icon: values.icon,
            list_type: values.listType,
            is_submenu: values.isSubmenu,
            parent_path: values.parentPath || null,
            published: values.published,
            is_parent: values.is_parent
          },
        ]);

      if (error) {
        console.error("Errore durante la creazione della pagina:", error);
        toast.error("Errore durante la creazione della pagina.");
        return;
      }

      const newPage: PageData = {
        id: newPageId,
        title: values.title,
        content: values.content,
        path: values.path,
        imageUrl: selectedImage || values.imageUrl || null,
        icon: values.icon,
        listType: values.listType,
        listItems: undefined,
        isSubmenu: values.isSubmenu,
        parentPath: values.parentPath || null,
        pageImages: [],
        published: values.published,
        is_parent: values.is_parent
      };

      onPageCreate(newPage);
      toast.success("Pagina creata con successo!");
      navigate(0);
    } catch (error: any) {
      console.error("Si è verificato un errore:", error.message);
      toast.error("Si è verificato un errore durante la creazione della pagina.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <Input placeholder="Percorso della pagina (es: /chi-siamo)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <PageTypeSection 
          pageType={pageType}
          setPageType={setPageType}
          parentPath={parentPath}
          setParentPath={setParentPath}
          parentPages={parentPages}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenuto</FormLabel>
              <FormControl>
                <Textarea placeholder="Contenuto della pagina" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icona</FormLabel>
                <FormControl>
                  <Input placeholder="Icona (es: smile)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Pubblicata</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <ImageUploader onImageSelected={setSelectedImage} />

        <Button type="submit" disabled={isCreating}>
          {isCreating ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Creazione...
            </>
          ) : (
            "Crea Pagina"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CreatePageForm;
