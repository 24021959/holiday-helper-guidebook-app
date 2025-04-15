
import React, { useState } from "react";
import { useRouter } from '@/lib/next-router-mock';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  FileText, 
  FolderOpen, 
  Home, 
  Calendar, 
  Map, 
  Info, 
  Phone, 
  Mail, 
  Image, 
  Star, 
  Coffee, 
  Utensils, 
  Bed, 
  Wifi, 
  Car, 
  CreditCard, 
  MapPin, 
  Key, 
  Bell, 
  Users, 
  Clock, 
  HelpCircle,
  LayoutGrid
} from 'lucide-react';
import { usePageCreation } from "@/hooks/usePageCreation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Editor } from "@/components/editor/Editor";
import { uploadImage } from "@/integrations/supabase/storage";
import ImagesUploader, { ImageItem as UploaderImageItem } from "@/components/ImagesUploader";
import { ImageItem } from "@/pages/Admin";

const pageFormSchema = z.object({
  title: z.string().min(2, {
    message: "Il titolo deve essere di almeno 2 caratteri.",
  }),
  content: z.string().optional(),
  icon: z.string().optional(),
  isParent: z.boolean().default(false).optional(),
  parentPath: z.string().optional(),
  pageType: z.enum(["normal", "submenu", "parent"]).default("normal"),
});

interface CreatePageFormProps {
  parentPages: { id: string; title: string; path: string; }[];
  onPageCreated: (pages: any[]) => void;
  keywordToIconMap: Record<string, string>;
}

// Carefully defining the conversion function with explicit typing
const convertToAdminImageItem = (images: UploaderImageItem[]): ImageItem[] => {
  return images.map(img => {
    // Ensure position is only one of the allowed values with proper validation
    let position: "left" | "center" | "right" | "full";
    
    if (img.position === "left") {
      position = "left";
    } else if (img.position === "right") {
      position = "right";
    } else if (img.position === "full") {
      position = "full";
    } else {
      // Default to center for other values
      position = "center";
    }
    
    return {
      url: img.url,
      position: position,
      caption: img.caption || "",
      type: "image" as const
    };
  });
};

const CreatePageForm: React.FC<CreatePageFormProps> = ({ parentPages, onPageCreated, keywordToIconMap }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<UploaderImageItem[]>([]);
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(undefined);
  const [selectedParentPath, setSelectedParentPath] = useState<string | undefined>(undefined);
  const { isCreating, isTranslating, handleTranslateAndCreate } = usePageCreation({ onPageCreated });

  const form = useForm<z.infer<typeof pageFormSchema>>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: "",
      content: "",
      icon: "FileText",
      isParent: false,
      pageType: "normal",
    },
  });

  const { watch, setValue } = form;
  const pageType = watch("pageType");
  const isParentPage = pageType === "parent";

  const handleImageUpload = async (file: File) => {
    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage(file);
      setUploadedImage(imageUrl);
      toast.success("Immagine caricata con successo!");
    } catch (error) {
      console.error("Errore durante il caricamento dell'immagine:", error);
      toast.error("Errore durante il caricamento dell'immagine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setValue("icon", icon);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const onSubmit = async (values: z.infer<typeof pageFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (values.pageType === "submenu" && !selectedParentPath) {
        toast.error("Seleziona una pagina padre per il sottomenu.");
        return;
      }
      
      const convertedImages = convertToAdminImageItem(pageImages);
      
      await handleTranslateAndCreate(
        { 
          title: values.title, 
          content: values.content || "", 
          icon: values.icon 
        },
        values.pageType,
        selectedParentPath || "/",
        uploadedImage,
        convertedImages,
        () => {
          form.reset();
          setUploadedImage(null);
          setPageImages([]);
          setSelectedIcon(undefined);
          setSelectedParentPath(undefined);
        }
      );
    } catch (error) {
      console.error("Errore durante la creazione della pagina:", error);
      toast.error("Si è verificato un errore durante la creazione della pagina.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconOptions = [
    { value: "FileText", label: "File Text", icon: <FileText className="h-4 w-4 mr-2" /> },
    { value: "FolderOpen", label: "Folder Open", icon: <FolderOpen className="h-4 w-4 mr-2" /> },
    { value: "Home", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { value: "Calendar", label: "Calendar", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { value: "Map", label: "Map", icon: <Map className="h-4 w-4 mr-2" /> },
    { value: "Info", label: "Info", icon: <Info className="h-4 w-4 mr-2" /> },
    { value: "Phone", label: "Phone", icon: <Phone className="h-4 w-4 mr-2" /> },
    { value: "Mail", label: "Mail", icon: <Mail className="h-4 w-4 mr-2" /> },
    { value: "Image", label: "Image", icon: <Image className="h-4 w-4 mr-2" /> },
    { value: "Star", label: "Star", icon: <Star className="h-4 w-4 mr-2" /> },
    { value: "Coffee", label: "Coffee", icon: <Coffee className="h-4 w-4 mr-2" /> },
    { value: "Utensils", label: "Utensils", icon: <Utensils className="h-4 w-4 mr-2" /> },
    { value: "Bed", label: "Bed", icon: <Bed className="h-4 w-4 mr-2" /> },
    { value: "Wifi", label: "Wifi", icon: <Wifi className="h-4 w-4 mr-2" /> },
    { value: "Car", label: "Car", icon: <Car className="h-4 w-4 mr-2" /> },
    { value: "CreditCard", label: "Credit Card", icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { value: "MapPin", label: "Map Pin", icon: <MapPin className="h-4 w-4 mr-2" /> },
    { value: "Key", label: "Key", icon: <Key className="h-4 w-4 mr-2" /> },
    { value: "Bell", label: "Bell", icon: <Bell className="h-4 w-4 mr-2" /> },
    { value: "Users", label: "Users", icon: <Users className="h-4 w-4 mr-2" /> },
    { value: "Clock", label: "Clock", icon: <Clock className="h-4 w-4 mr-2" /> },
    { value: "HelpCircle", label: "Help Circle", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    { value: "LayoutGrid", label: "Layout Grid", icon: <LayoutGrid className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
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
              name="pageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di Pagina</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un tipo di pagina" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="submenu">Sottomenu</SelectItem>
                      <SelectItem value="parent">Pagina Genitore</SelectItem>
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
                control={form.control}
                name="parentPath"
                render={() => (
                  <FormItem>
                    <FormLabel>Pagina Genitore</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        setSelectedParentPath(value);
                        setValue("parentPath", value);
                      }}
                      defaultValue={selectedParentPath}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona la pagina genitore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentPages.map((page) => (
                          <SelectItem key={page.id} value={page.path}>
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

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icona</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      handleIconSelect(value);
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un'icona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-80 overflow-auto">
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center">
                            {icon.icon}
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleziona l'icona da visualizzare nel menu.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!isParentPage && (
            <>
              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FormLabel>Immagine Principale</FormLabel>
                  <FormDescription>
                    Carica un'immagine da visualizzare in cima alla pagina.
                  </FormDescription>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        type="button"
                        asChild
                      >
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {isSubmitting ? "Caricando..." : "Carica Immagine"}
                        </label>
                      </Button>
                      {uploadedImage && (
                        <div className="relative">
                          <img
                            src={uploadedImage}
                            alt="Anteprima"
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="absolute top-0 right-0"
                            onClick={handleRemoveImage}
                          >
                            <span className="sr-only">Rimuovi</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </div>

                <div>
                  <FormLabel>Immagini nella pagina</FormLabel>
                  <FormDescription>
                    Aggiungi immagini da mostrare all'interno della pagina.
                  </FormDescription>
                  <FormControl>
                    <ImagesUploader images={pageImages} onChange={setPageImages} />
                  </FormControl>
                </div>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenuto</FormLabel>
                    <FormDescription>
                      Scrivi il contenuto della pagina. Puoi usare Markdown per formattare
                      il testo.
                    </FormDescription>
                    <FormControl>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={100}>
                          <Editor
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" disabled={isSubmitting || isCreating || isTranslating}>
            {isSubmitting ? "Creazione in corso..." : (isCreating || isTranslating) ? "Traduzione in corso..." : "Crea Pagina"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreatePageForm;
