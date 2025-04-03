
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";
import { 
  FileText, Book, Coffee, Utensils, Phone, 
  Wifi, Bus, ShoppingCart, Calendar, 
  Hotel, Bike, Map, Info, Image,
  Landmark, Building, Trees, Mountain, 
  Users, Music, Camera, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/pages/Admin";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface CreatePageFormProps {
  parentPages: PageData[];
  onPageCreated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
}

const formSchema = z.object({
  title: z.string().min(2, "Il titolo deve essere di almeno 2 caratteri"),
  path: z.string().min(1, "Il percorso è obbligatorio"),
  content: z.string(),
  isSubmenu: z.boolean().optional(),
  parentPath: z.string().optional(),
  icon: z.string(),
  listType: z.enum(["locations", "activities", "restaurants"]).optional(),
});

export const CreatePageForm: React.FC<CreatePageFormProps> = ({ 
  parentPages, 
  onPageCreated,
  keywordToIconMap
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmenu, setIsSubmenu] = useState<boolean>(false);
  const [parentPath, setParentPath] = useState<string>("");
  const [locationItems, setLocationItems] = useState<{ name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[]>([]);
  const [locationName, setLocationName] = useState<string>("");
  const [locationDescription, setLocationDescription] = useState<string>("");
  const [locationPhone, setLocationPhone] = useState<string>("");
  const [locationMapsUrl, setLocationMapsUrl] = useState<string>("");
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants" | undefined>(undefined);
  const [selectedIcon, setSelectedIcon] = useState<string>("FileText");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      path: "",
      content: "",
      isSubmenu: false,
      icon: "FileText",
    },
  });

  useEffect(() => {
    // Update form values when isSubmenu changes
    form.setValue("isSubmenu", isSubmenu);
    if (isSubmenu) {
      form.setValue("parentPath", parentPath);
    } else {
      form.setValue("parentPath", undefined);
      setParentPath("");
    }
  }, [isSubmenu, parentPath, form]);

  // Update path based on title
  useEffect(() => {
    const title = form.watch("title");
    if (title) {
      const suggestedPath = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
      
      form.setValue("path", suggestedPath);
    }
  }, [form.watch("title"), form]);

  // Update icon based on title
  useEffect(() => {
    const title = form.watch("title");
    if (title) {
      const words = title.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (keywordToIconMap[word]) {
          setSelectedIcon(keywordToIconMap[word]);
          form.setValue("icon", keywordToIconMap[word]);
          break;
        }
      }
    }
  }, [form.watch("title"), keywordToIconMap, form]);

  const handleAddLocation = () => {
    if (!locationName.trim()) {
      toast.error("Il nome del luogo è obbligatorio");
      return;
    }
    
    const newLocation = {
      name: locationName,
      description: locationDescription || undefined,
      phoneNumber: locationPhone || undefined,
      mapsUrl: locationMapsUrl || undefined
    };
    
    setLocationItems([...locationItems, newLocation]);
    setLocationName("");
    setLocationDescription("");
    setLocationPhone("");
    setLocationMapsUrl("");
    
    toast.success("Luogo aggiunto alla lista");
  };

  const handleRemoveLocation = (index: number) => {
    const updatedLocations = [...locationItems];
    updatedLocations.splice(index, 1);
    setLocationItems(updatedLocations);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const pageId = uuidv4();
      const finalPath = isSubmenu 
        ? `${parentPath}/${values.path}` 
        : `/${values.path}`;
      
      // Prepare data for insertion to custom_pages table
      const pageData = {
        id: pageId,
        title: values.title,
        content: values.content,
        path: finalPath,
        image_url: uploadedImage,
        icon: values.icon || selectedIcon,
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null,
        list_type: listType,
        list_items: listType && locationItems.length > 0 ? locationItems : null
      };

      // 1. Insert into custom_pages table
      const { error: pagesError } = await supabase
        .from('custom_pages')
        .insert(pageData);
      
      if (pagesError) throw pagesError;
      
      // 2. Insert into menu_icons table
      const iconData = {
        label: values.title,
        path: finalPath,
        icon: values.icon || selectedIcon,
        bg_color: "bg-blue-200",
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null
      };

      const { error: iconError } = await supabase
        .from('menu_icons')
        .insert(iconData);
      
      if (iconError) throw iconError;
      
      // Fetch all pages to update the list
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (fetchError) throw fetchError;
      
      if (pagesData) {
        const formattedPages = pagesData.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined
        }));
        
        // Update pages list in parent component
        onPageCreated(formattedPages);
      }
      
      // Reset form and state
      form.reset();
      setUploadedImage(null);
      setIsSubmenu(false);
      setParentPath("");
      setLocationItems([]);
      setListType(undefined);
      setSelectedIcon("FileText");
      
      toast.success("Pagina creata con successo");
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nel salvare la pagina");
    }
  };

  // Icon mappings for the icon selector
  const iconOptions = [
    { value: "FileText", label: "Documento", icon: <FileText /> },
    { value: "Image", label: "Immagine", icon: <Image /> },
    { value: "Info", label: "Informazioni", icon: <Info /> },
    { value: "Map", label: "Mappa", icon: <Map /> },
    { value: "Utensils", label: "Ristorante", icon: <Utensils /> },
    { value: "Landmark", label: "Luoghi", icon: <Landmark /> },
    { value: "Hotel", label: "Hotel", icon: <Hotel /> },
    { value: "Wifi", label: "WiFi", icon: <Wifi /> },
    { value: "Bus", label: "Trasporti", icon: <Bus /> },
    { value: "ShoppingCart", label: "Negozi", icon: <ShoppingCart /> },
    { value: "Calendar", label: "Eventi", icon: <Calendar /> },
    { value: "Phone", label: "Contatti", icon: <Phone /> },
    { value: "Book", label: "Guide", icon: <Book /> },
    { value: "Coffee", label: "Bar", icon: <Coffee /> },
    { value: "Bike", label: "Attività", icon: <Bike /> },
    { value: "Building", label: "Edifici", icon: <Building /> },
    { value: "Trees", label: "Natura", icon: <Trees /> },
    { value: "Mountain", label: "Montagne", icon: <Mountain /> },
    { value: "Users", label: "Persone", icon: <Users /> },
    { value: "Music", label: "Musica", icon: <Music /> },
    { value: "Camera", label: "Fotografia", icon: <Camera /> },
    { value: "Globe", label: "Internazionale", icon: <Globe /> },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titolo della Pagina</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci il titolo" {...field} />
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
                <FormLabel>Percorso URL</FormLabel>
                <FormControl>
                  <Input placeholder="percorso-url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>Tipo di Pagina</FormLabel>
            <div className="flex items-center space-x-2 mt-2">
              <input 
                type="checkbox" 
                id="isSubmenu"
                checked={isSubmenu}
                onChange={(e) => setIsSubmenu(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
              />
              <label htmlFor="isSubmenu" className="text-sm text-gray-700">
                Sottomenu
              </label>
            </div>
            
            {isSubmenu && (
              <div className="mt-3">
                <FormLabel>Pagina Genitore</FormLabel>
                <Select value={parentPath} onValueChange={setParentPath}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona pagina genitore" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentPages.map((page) => (
                      <SelectItem key={page.id} value={page.path}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icona</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedIcon(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un'icona" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenuto</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Inserisci il contenuto della pagina"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Immagine</FormLabel>
          <div className="mt-2">
            <ImageUploader onImageUpload={setUploadedImage} />
            
            {uploadedImage && (
              <div className="mt-3 relative inline-block">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="h-32 object-cover rounded-md" 
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => setUploadedImage(null)}
                >
                  Rimuovi
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <FormLabel>Tipo di Lista (opzionale)</FormLabel>
          <Select value={listType} onValueChange={(value: "locations" | "activities" | "restaurants") => setListType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un tipo di lista (opzionale)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="locations">Luoghi di Interesse</SelectItem>
              <SelectItem value="activities">Attività</SelectItem>
              <SelectItem value="restaurants">Ristoranti</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {listType && (
          <div className="border p-4 rounded-lg bg-gray-50">
            <h3 className="font-medium mb-3">
              {listType === "locations" ? "Aggiungi Luoghi" : 
               listType === "activities" ? "Aggiungi Attività" : 
               "Aggiungi Ristoranti"}
            </h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <FormLabel>Nome</FormLabel>
                <Input 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder={`Nome ${listType === "locations" ? "del luogo" : 
                              listType === "activities" ? "dell'attività" : 
                              "del ristorante"}`}
                />
              </div>
              
              <div>
                <FormLabel>Descrizione (opzionale)</FormLabel>
                <Textarea 
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="Breve descrizione"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <FormLabel>Telefono (opzionale)</FormLabel>
                  <Input 
                    value={locationPhone}
                    onChange={(e) => setLocationPhone(e.target.value)}
                    placeholder="Numero di telefono"
                  />
                </div>
                
                <div>
                  <FormLabel>URL Maps (opzionale)</FormLabel>
                  <Input 
                    value={locationMapsUrl}
                    onChange={(e) => setLocationMapsUrl(e.target.value)}
                    placeholder="Link a Google Maps"
                  />
                </div>
              </div>
              
              <Button 
                type="button"
                onClick={handleAddLocation}
                className="w-full"
              >
                Aggiungi alla Lista
              </Button>
            </div>
            
            {locationItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-emerald-700">
                  {locationItems.length} elementi aggiunti:
                </h4>
                <ul className="space-y-2">
                  {locationItems.map((item, index) => (
                    <li key={index} className="bg-white p-2 rounded border flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLocation(index)}
                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                      >
                        Rimuovi
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <Button type="submit" className="w-full">Crea Pagina</Button>
      </form>
    </Form>
  );
};
