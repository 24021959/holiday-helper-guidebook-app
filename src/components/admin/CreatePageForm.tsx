import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploader from "@/components/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/pages/Admin";

interface CreatePageFormProps {
  parentPages: PageData[];
  onPageCreated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, React.ReactNode>;
}

interface FormValues {
  title: string;
  content: string;
  path: string;
  imageUrl: string;
  icon: string;
  isSubmenu: boolean;
  parentPath: string;
  listType?: "locations" | "activities" | "restaurants";
  listItems?: Array<{
    name: string;
    description?: string;
    phoneNumber?: string;
    mapsUrl?: string;
  }>;
}

export const CreatePageForm: React.FC<CreatePageFormProps> = ({ 
  parentPages, 
  onPageCreated,
  keywordToIconMap 
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showListBuilder, setShowListBuilder] = useState<boolean>(false);
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants" | undefined>();
  const [listItems, setListItems] = useState<Array<{
    name: string;
    description?: string;
    phoneNumber?: string;
    mapsUrl?: string;
  }>>([]);
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemPhoneNumber, setItemPhoneNumber] = useState<string>("");
  const [itemMapsUrl, setItemMapsUrl] = useState<string>("");
  const [isSubmenu, setIsSubmenu] = useState<boolean>(false);
  const [parentPath, setParentPath] = useState<string>("");
  
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      content: "",
      path: "",
      imageUrl: "",
      icon: "FileText",
      isSubmenu: false,
      parentPath: "",
    }
  });

  const addListItem = () => {
    if (itemName.trim() === "") {
      toast.error("Il nome dell'elemento è obbligatorio");
      return;
    }
    
    setListItems([
      ...listItems,
      {
        name: itemName,
        description: itemDescription || undefined,
        phoneNumber: itemPhoneNumber || undefined,
        mapsUrl: itemMapsUrl || undefined
      }
    ]);
    
    setItemName("");
    setItemDescription("");
    setItemPhoneNumber("");
    setItemMapsUrl("");
    
    toast.success("Elemento aggiunto alla lista");
  };
  
  const removeListItem = (index: number) => {
    const newItems = [...listItems];
    newItems.splice(index, 1);
    setListItems(newItems);
    toast.info("Elemento rimosso dalla lista");
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isSubmenu && !parentPath) {
        toast.error("È necessario selezionare una pagina principale per il sottomenu");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the data object
      const pageData = {
        id: uuidv4(),
        title: data.title,
        content: data.content,
        path: data.path,
        imageUrl: uploadedImage || "",
        icon: data.icon,
        isSubmenu: isSubmenu,
        parentPath: isSubmenu ? parentPath : undefined,
        ...(showListBuilder && listType ? { listType } : {}),
        ...(showListBuilder && listItems.length > 0 ? { listItems } : {})
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('custom_pages')
        .insert({
          id: pageData.id,
          title: pageData.title,
          content: pageData.content,
          path: pageData.path,
          image_url: pageData.imageUrl,
          icon: pageData.icon,
          is_submenu: pageData.isSubmenu,
          parent_path: pageData.parentPath,
          list_type: listType,
          list_items: listItems.length > 0 ? listItems : null
        });
      
      if (error) throw error;
      
      // Fetch all pages to update the state
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
          listItems: page.list_items as Array<{
            name: string;
            description?: string;
            phoneNumber?: string;
            mapsUrl?: string;
          }> | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined
        }));
        
        // Update pages in parent component
        onPageCreated(formattedPages);
        
        // Save to localStorage as fallback
        localStorage.setItem("customPages", JSON.stringify(formattedPages));
      }
      
      toast.success("Pagina creata con successo");
      form.reset();
      setUploadedImage(null);
      setShowListBuilder(false);
      setListType(undefined);
      setListItems([]);
      setIsSubmenu(false);
      setParentPath("");
      
    } catch (error) {
      console.error("Errore nella creazione della pagina:", error);
      toast.error("Errore nella creazione della pagina");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titolo Pagina</FormLabel>
                <FormControl>
                  <Input required placeholder="Titolo della pagina" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Pagina</FormLabel>
                <FormControl>
                  <Input 
                    required 
                    placeholder="URL della pagina (es: servizi, contatti)" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenuto Pagina</FormLabel>
              <FormControl>
                <Textarea 
                  required 
                  placeholder="Contenuto della pagina..."
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <label className="block text-sm font-medium">Immagine Pagina</label>
          <ImageUploader 
            onImageUploaded={setUploadedImage}
            currentImage={uploadedImage}
          />
        </div>
        
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icona Pagina</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli un'icona" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {Object.keys(keywordToIconMap).map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <span className="flex w-5 h-5 items-center justify-center">
                            {keywordToIconMap[iconName]}
                          </span>
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={isSubmenu} 
              onChange={(e) => setIsSubmenu(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>È una pagina di sottomenu</span>
          </label>
          
          {isSubmenu && (
            <div>
              <label className="block text-sm font-medium mb-1">Pagina Principale</label>
              <Select value={parentPath} onValueChange={setParentPath}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona la pagina principale" />
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
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={showListBuilder} 
              onChange={(e) => setShowListBuilder(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Aggiungi una lista di elementi</span>
          </label>
          
          {showListBuilder && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium">Costruttore di Lista</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo di Lista</label>
                <Select 
                  value={listType} 
                  onValueChange={(value) => setListType(value as "locations" | "activities" | "restaurants")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona un tipo di lista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locations">Luoghi</SelectItem>
                    <SelectItem value="activities">Attività</SelectItem>
                    <SelectItem value="restaurants">Ristoranti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Input 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Nome elemento *"
                />
                <Textarea 
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Descrizione (opzionale)"
                  rows={2}
                />
                <Input 
                  value={itemPhoneNumber}
                  onChange={(e) => setItemPhoneNumber(e.target.value)}
                  placeholder="Numero di telefono (opzionale)"
                />
                <Input 
                  value={itemMapsUrl}
                  onChange={(e) => setItemMapsUrl(e.target.value)}
                  placeholder="URL Google Maps (opzionale)"
                />
                <Button 
                  type="button"
                  onClick={addListItem}
                  variant="outline"
                >
                  Aggiungi Elemento
                </Button>
              </div>
              
              {listItems.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Elementi aggiunti:</h4>
                  <ul className="space-y-2">
                    {listItems.map((item, index) => (
                      <li key={index} className="p-2 bg-white border rounded flex justify-between items-center">
                        <span>{item.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem(index)}
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
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Creazione in corso..." : "Crea Pagina"}
        </Button>
      </form>
    </Form>
  );
};
