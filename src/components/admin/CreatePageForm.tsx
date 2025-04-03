
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/ImageUploader";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  FileText, MessageCircle, Home, 
  MapPin, Book, Coffee, Utensils, Phone, 
  Wifi, Bus, ShoppingCart, Calendar, 
  Hotel, Bike, Map, Info, Image,
  Landmark, Building, Trees, Mountain, 
  Users, Music, Camera, Globe,
  Newspaper, PawPrint, Heart, Bookmark, ShoppingBag,
  Plus, Trash2
} from "lucide-react";
import { PageData } from "@/pages/Admin";

interface LocationItem {
  name: string;
  description?: string;
  phoneNumber?: string;
  mapsUrl?: string;
}

interface CreatePageFormProps {
  parentPages: PageData[];
  onPageCreated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
}

export const CreatePageForm: React.FC<CreatePageFormProps> = ({ 
  parentPages, 
  onPageCreated,
  keywordToIconMap 
}) => {
  const [newPage, setNewPage] = useState<Omit<PageData, 'id'>>({
    title: "",
    content: "",
    path: "",
    imageUrl: "",
    icon: "FileText",
    isSubmenu: false,
    parentPath: ""
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isList, setIsList] = useState<boolean>(false);
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants">("locations");
  const [listItems, setListItems] = useState<LocationItem[]>([]);
  const [currentItem, setCurrentItem] = useState<LocationItem>({
    name: "",
    description: "",
    phoneNumber: "",
    mapsUrl: ""
  });
  const [selectedColor, setSelectedColor] = useState<string>("bg-blue-200");
  const [isSubmenu, setIsSubmenu] = useState<boolean>(false);
  const [selectedParent, setSelectedParent] = useState<string>("");

  const availableIcons = [
    { name: "FileText", label: "Documento" },
    { name: "Image", label: "Immagine" },
    { name: "MessageCircle", label: "Chat" },
    { name: "Info", label: "Informazione" },
    { name: "Map", label: "Mappa" },
    { name: "Utensils", label: "Ristorante" },
    { name: "Landmark", label: "Museo" },
    { name: "Hotel", label: "Hotel" },
    { name: "Wifi", label: "Wifi" },
    { name: "Bus", label: "Trasporto" },
    { name: "ShoppingBag", label: "Shopping" },
    { name: "Calendar", label: "Eventi" },
    { name: "Phone", label: "Contatti" },
    { name: "Book", label: "Storia/Cultura" },
    { name: "Coffee", label: "Bar/Caffè" },
    { name: "Home", label: "Benvenuto" },
    { name: "Bike", label: "Attività" }
  ];

  const availableColors = [
    { color: "bg-blue-200", label: "Blu" },
    { color: "bg-green-200", label: "Verde" },
    { color: "bg-yellow-200", label: "Giallo" },
    { color: "bg-purple-200", label: "Viola" },
    { color: "bg-pink-200", label: "Rosa" },
    { color: "bg-orange-200", label: "Arancione" },
    { color: "bg-teal-200", label: "Teal" },
    { color: "bg-red-200", label: "Rosso" }
  ];

  const generateSlugFromTitle = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/[àáâäãåą]/g, 'a')
      .replace(/[èéêëęė]/g, 'e')
      .replace(/[ìíîïį]/g, 'i')
      .replace(/[òóôöõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñń]/g, 'n')
      .replace(/[ß]/g, 'ss');
  };

  const determineIconFromTitle = (title: string): string => {
    const lowercaseTitle = title.toLowerCase();
    
    for (const [keyword, icon] of Object.entries(keywordToIconMap)) {
      if (lowercaseTitle.includes(keyword.toLowerCase())) {
        return icon;
      }
    }
    
    return "FileText";
  };

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setNewPage({...newPage, imageUrl: imageDataUrl});
    toast.success("Immagine caricata con successo");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const path = generateSlugFromTitle(title);
    const icon = determineIconFromTitle(title);
    
    setNewPage({
      ...newPage, 
      title, 
      path,
      icon
    });
  };

  const handleAddItem = () => {
    if (!currentItem.name) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    
    setListItems([...listItems, { ...currentItem }]);
    setCurrentItem({
      name: "",
      description: "",
      phoneNumber: "",
      mapsUrl: ""
    });
    
    toast.success("Elemento aggiunto alla lista");
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...listItems];
    updatedItems.splice(index, 1);
    setListItems(updatedItems);
    toast.info("Elemento rimosso");
  };

  const handleSavePage = async () => {
    if (!newPage.title || !newPage.content) {
      toast.error("Titolo e contenuto sono obbligatori");
      return;
    }

    try {
      const pageToSave = { 
        title: newPage.title,
        content: newPage.content,
        path: newPage.path || generateSlugFromTitle(newPage.title),
        image_url: uploadedImage || newPage.imageUrl,
        icon: newPage.icon || "FileText",
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? selectedParent : null
      };
      
      if (isList && listItems.length > 0) {
        pageToSave.list_type = listType;
        pageToSave.list_items = listItems;
      }
      
      const { data: savedPage, error } = await supabase
        .from('custom_pages')
        .insert(pageToSave)
        .select()
        .single();
      
      if (error) throw error;
      
      await addIconToMenu(savedPage);
      
      toast.success("Pagina creata con successo!");
      
      // Reset form
      setNewPage({
        title: "",
        content: "",
        path: "",
        imageUrl: "",
        icon: "FileText",
        isSubmenu: false,
        parentPath: ""
      });
      setUploadedImage(null);
      setIsList(false);
      setListItems([]);
      setListType("locations");
      setIsSubmenu(false);
      setSelectedParent("");
      
      // Update pages list
      const { data: updatedPages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (!pagesError && updatedPages) {
        const formattedPages = updatedPages.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items as LocationItem[] | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined
        }));
        
        onPageCreated(formattedPages);
      }
    } catch (error) {
      console.error("Errore nel salvare la pagina:", error);
      toast.error("Errore nel salvare la pagina");
    }
  };

  const addIconToMenu = async (page: any) => {
    try {
      const iconData = {
        icon: page.icon || "FileText",
        label: page.title,
        bg_color: selectedColor,
        path: page.path,
        is_submenu: page.is_submenu,
        parent_path: page.parent_path
      };
      
      const { error } = await supabase
        .from('menu_icons')
        .insert(iconData);
      
      if (error) throw error;
      
      toast.success("Icona aggiunta al menu");
    } catch (error) {
      console.error("Errore nell'aggiungere l'icona al menu:", error);
      toast.error("Errore nell'aggiungere l'icona al menu");
    }
  };

  const renderIconPreview = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'Image': return <Image className="w-6 h-6" />;
      case 'MessageCircle': return <MessageCircle className="w-6 h-6" />;
      case 'Info': return <Info className="w-6 h-6" />;
      case 'Map': return <Map className="w-6 h-6" />;
      case 'Utensils': return <Utensils className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'Hotel': return <Hotel className="w-6 h-6" />;
      case 'Wifi': return <Wifi className="w-6 h-6" />;
      case 'Bus': return <Bus className="w-6 h-6" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
      case 'Calendar': return <Calendar className="w-6 h-6" />;
      case 'Phone': return <Phone className="w-6 h-6" />;
      case 'Book': return <Book className="w-6 h-6" />;
      case 'Coffee': return <Coffee className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Bike': return <Bike className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="title">Titolo Pagina</Label>
        <Input 
          id="title" 
          value={newPage.title} 
          onChange={handleTitleChange}
          placeholder="Titolo della pagina"
          className="mb-1"
        />
        {newPage.path && (
          <p className="text-xs text-gray-500">
            URL generato: /{newPage.path}
          </p>
        )}
      </div>

      <div className="flex items-center mb-2">
        <input 
          type="checkbox" 
          id="isSubmenu"
          checked={isSubmenu}
          onChange={(e) => setIsSubmenu(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 mr-2"
        />
        <Label htmlFor="isSubmenu" className="cursor-pointer">Questa è una sottopagina</Label>
      </div>
      
      {isSubmenu && (
        <div className="mb-4">
          <Label htmlFor="parentPage">Seleziona la pagina principale</Label>
          <Select 
            value={selectedParent} 
            onValueChange={setSelectedParent}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona una pagina principale" />
            </SelectTrigger>
            <SelectContent>
              {parentPages.map(page => (
                <SelectItem key={page.id} value={page.path}>
                  {page.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {parentPages.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Non ci sono pagine principali disponibili. Crea prima una pagina principale.
            </p>
          )}
        </div>
      )}
      
      <div>
        <Label htmlFor="icon">Icona per il Menu</Label>
        <div className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded-md">
          <div className={`${selectedColor} p-2 rounded-md inline-flex items-center justify-center`}>
            {renderIconPreview(newPage.icon || "FileText")}
          </div>
          <div>
            <p className="font-medium">{newPage.title || "Titolo pagina"}</p>
            <p className="text-xs text-gray-500">Icona selezionata automaticamente in base al titolo</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
          {availableIcons.map((icon) => (
            <div 
              key={icon.name} 
              className={`flex flex-col items-center p-2 rounded-md cursor-pointer ${newPage.icon === icon.name ? 'bg-emerald-100 border border-emerald-300' : 'hover:bg-gray-100'}`}
              onClick={() => setNewPage({...newPage, icon: icon.name})}
            >
              {renderIconPreview(icon.name)}
              <span className="text-xs mt-1">{icon.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="color">Colore di Sfondo</Label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
          {availableColors.map((colorOption) => (
            <div 
              key={colorOption.color} 
              className={`h-8 rounded-md cursor-pointer ${colorOption.color} ${selectedColor === colorOption.color ? 'ring-2 ring-emerald-500' : ''}`}
              onClick={() => setSelectedColor(colorOption.color)}
              title={colorOption.label}
            />
          ))}
        </div>
      </div>
      
      <div>
        <Label className="block mb-2">Immagine (JPG, PNG)</Label>
        <ImageUploader onImageUpload={handleImageUpload} />
        
        {uploadedImage && (
          <div className="mt-2 relative">
            <img 
              src={uploadedImage} 
              alt="Anteprima" 
              className="w-full max-h-48 object-contain border rounded-md" 
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setUploadedImage(null);
                setNewPage({...newPage, imageUrl: ""});
              }}
            >
              Rimuovi
            </Button>
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="content">Contenuto Pagina</Label>
        <Textarea 
          id="content"
          className="min-h-[200px]"
          value={newPage.content} 
          onChange={(e) => setNewPage({...newPage, content: e.target.value})}
          placeholder="Inserisci il contenuto della pagina qui..."
        />
      </div>
      
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="isList" className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isList"
              checked={isList}
              onChange={(e) => setIsList(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600"
            />
            <span>Include elenco di {listType}</span>
          </Label>
          
          {isList && (
            <Select 
              value={listType} 
              onValueChange={(value: "locations" | "activities" | "restaurants") => setListType(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo di lista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="locations">Luoghi</SelectItem>
                <SelectItem value="restaurants">Ristoranti</SelectItem>
                <SelectItem value="activities">Attività</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {isList && (
          <div className="space-y-4 mt-4 border rounded-md p-4 bg-gray-50">
            <h3 className="text-md font-medium text-emerald-700">
              {listType === "restaurants" ? "Aggiungi Ristoranti" : 
              listType === "activities" ? "Aggiungi Attività" : 
              "Aggiungi Luoghi"}
            </h3>
            
            <div className="grid gap-2">
              <div>
                <Label htmlFor="itemName">Nome</Label>
                <Input 
                  id="itemName" 
                  value={currentItem.name} 
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                  placeholder={`Nome ${listType === "restaurants" ? "ristorante" : 
                    listType === "activities" ? "attività" : "luogo"}`}
                />
              </div>
              
              <div>
                <Label htmlFor="itemDescription">Descrizione</Label>
                <Input 
                  id="itemDescription" 
                  value={currentItem.description || ""} 
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  placeholder="Breve descrizione"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="itemPhone">Telefono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input 
                      id="itemPhone" 
                      value={currentItem.phoneNumber || ""} 
                      onChange={(e) => setCurrentItem({...currentItem, phoneNumber: e.target.value})}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="itemMaps">Google Maps</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input 
                      id="itemMaps" 
                      value={currentItem.mapsUrl || ""} 
                      onChange={(e) => setCurrentItem({...currentItem, mapsUrl: e.target.value})}
                      placeholder="https://maps.google.com/?q=..."
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleAddItem} 
                className="w-full mt-2"
                variant="secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi a lista
              </Button>
            </div>
            
            {listItems.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Elementi nella lista ({listItems.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Descrizione</TableHead>
                      <TableHead>Contatti</TableHead>
                      <TableHead className="w-20">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.description ? (
                            item.description.length > 50 ? 
                              `${item.description.substring(0, 50)}...` : 
                              item.description
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.phoneNumber && <Phone className="h-4 w-4 text-gray-500" />}
                            {item.mapsUrl && <MapPin className="h-4 w-4 text-gray-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleSavePage}
        disabled={isSubmenu && !selectedParent}
      >
        Salva Pagina
      </Button>
    </div>
  );
};
