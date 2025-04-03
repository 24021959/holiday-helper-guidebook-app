import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Image, FileImage, MessageCircle, Home, 
  MapPin, Book, Coffee, Utensils, Phone, 
  Wifi, Bus, ShoppingCart, Calendar, 
  Hotel, Bike, Map, Info, FileText, 
  Landmark, Building, Trees, Mountain, 
  Users, Music, Camera, Globe,
  Newspaper, PawPrint, Heart, Bookmark, ShoppingBag,
  Plus, Trash2, ExternalLink
} from "lucide-react";
import BackToMenu from "@/components/BackToMenu";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

interface LocationItem {
  name: string;
  description?: string;
  phoneNumber?: string;
  mapsUrl?: string;
}

interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  icon?: string;
  listType?: "locations" | "activities" | "restaurants";
  listItems?: LocationItem[];
  isSubmenu: boolean;
  parentPath?: string;
  headerColor?: string;
  logoUrl?: string;
}

interface MenuIcon {
  icon: string;
  label: string;
  bgColor: string;
  path: string;
}

const keywordToIconMap: Record<string, string> = {
  "ristorante": "Utensils",
  "ristoro": "Utensils",
  "cucina": "Utensils",
  "cibo": "Utensils",
  "cena": "Utensils",
  "pranzo": "Utensils",
  "colazione": "Coffee",
  "caffè": "Coffee",
  "bar": "Coffee",
  "bevande": "Coffee",
  "museo": "Landmark",
  "mostra": "Landmark",
  "esposizione": "Landmark",
  "galleria": "Image",
  "immagini": "Image",
  "foto": "Camera",
  "hotel": "Hotel",
  "alloggio": "Hotel",
  "camera": "Hotel",
  "dormire": "Hotel",
  "albergo": "Hotel",
  "soggiorno": "Hotel",
  "trasporto": "Bus",
  "bus": "Bus",
  "treno": "Bus",
  "navetta": "Bus",
  "viaggio": "Globe",
  "escursione": "Mountain",
  "montagna": "Mountain",
  "mare": "Map",
  "spiaggia": "Map",
  "shopping": "ShoppingBag",
  "acquisti": "ShoppingCart",
  "negozi": "ShoppingBag",
  "eventi": "Calendar",
  "evento": "Calendar",
  "programma": "Calendar",
  "news": "Newspaper",
  "notizie": "Newspaper",
  "informazioni": "Info",
  "info": "Info",
  "contatti": "Phone",
  "contatto": "Phone",
  "telefono": "Phone",
  "email": "MessageCircle",
  "messaggio": "MessageCircle",
  "chat": "MessageCircle",
  "posizione": "MapPin",
  "mappa": "Map",
  "indirizzo": "MapPin",
  "dove": "MapPin",
  "come arrivare": "MapPin",
  "attività": "Bike",
  "sport": "Bike",
  "intrattenimento": "Music",
  "musica": "Music",
  "storia": "Book",
  "cultura": "Book",
  "tradizione": "Book",
  "wifi": "Wifi",
  "internet": "Wifi",
  "connessione": "Wifi",
  "animali": "PawPrint",
  "pet": "PawPrint",
  "natura": "Trees",
  "parco": "Trees",
  "giardino": "Trees",
  "persone": "Users",
  "ospiti": "Users",
  "clienti": "Users",
  "staff": "Users",
  "benessere": "Heart",
  "spa": "Heart",
  "relax": "Heart",
  "welcome": "Home",
  "benvenuto": "Home",
  "accoglienza": "Home"
};

const Admin: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
  const [chatbotCode, setChatbotCode] = useState<string>("");
  const [isList, setIsList] = useState<boolean>(false);
  const [listType, setListType] = useState<"locations" | "activities" | "restaurants">("locations");
  const [listItems, setListItems] = useState<LocationItem[]>([]);
  const [currentItem, setCurrentItem] = useState<LocationItem>({
    name: "",
    description: "",
    phoneNumber: "",
    mapsUrl: ""
  });
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [headerColor, setHeaderColor] = useState<string>("bg-gradient-to-r from-teal-500 to-emerald-600");
  const [selectedColor, setSelectedColor] = useState<string>("bg-blue-200");
  const [isSubmenu, setIsSubmenu] = useState<boolean>(false);
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const [selectedParent, setSelectedParent] = useState<string>("");

  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      icon: "FileText",
    }
  });

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

  const headerColorOptions = [
    { value: "bg-gradient-to-r from-teal-500 to-emerald-600", label: "Teal/Emerald (Default)" },
    { value: "bg-gradient-to-r from-blue-500 to-indigo-600", label: "Blue/Indigo" },
    { value: "bg-gradient-to-r from-purple-500 to-pink-500", label: "Purple/Pink" },
    { value: "bg-gradient-to-r from-red-500 to-orange-500", label: "Red/Orange" },
    { value: "bg-gradient-to-r from-amber-400 to-yellow-500", label: "Amber/Yellow" },
    { value: "bg-white", label: "White" },
    { value: "bg-gray-800", label: "Dark Gray" },
    { value: "bg-black", label: "Black" }
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      navigate("/login");
    }
    
    const fetchAllData = async () => {
      try {
        const { data: pagesData, error: pagesError } = await supabase
          .from('custom_pages')
          .select('*');
        
        if (pagesError) throw pagesError;
        
        if (pagesData) {
          const formattedPages = pagesData.map(page => ({
            id: page.id,
            title: page.title,
            content: page.content,
            path: page.path,
            imageUrl: page.image_url,
            icon: page.icon,
            listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
            listItems: page.list_items as LocationItem[] | undefined,
            isSubmenu: page.is_submenu,
            parentPath: page.parent_path
          }));
          setPages(formattedPages);
          
          const potentialParents = formattedPages.filter(page => !page.isSubmenu);
          setParentPages(potentialParents);
        }
        
        const { data: headerData, error: headerError } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (headerError) {
          if (headerError.code !== 'PGRST116') {
            throw headerError;
          }
        }
        
        if (headerData) {
          if (headerData.logo_url) setUploadedLogo(headerData.logo_url);
          if (headerData.header_color) setHeaderColor(headerData.header_color);
        }
        
        const { data: chatbotData, error: chatbotError } = await supabase
          .from('chatbot_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (chatbotError) {
          if (chatbotError.code !== 'PGRST116') {
            throw chatbotError;
          }
        }
        
        if (chatbotData && chatbotData.code) {
          setChatbotCode(chatbotData.code);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        toast.error("Errore nel recupero dei dati da Supabase");
        
        const savedPages = localStorage.getItem("customPages");
        if (savedPages) {
          setPages(JSON.parse(savedPages));
          const potentialParents = JSON.parse(savedPages).filter((page: PageData) => !page.isSubmenu);
          setParentPages(potentialParents);
        }
        
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          const settings = JSON.parse(savedHeaderSettings);
          if (settings.logoUrl) setUploadedLogo(settings.logoUrl);
          if (settings.headerColor) setHeaderColor(settings.headerColor);
        }
        
        const savedChatbotCode = localStorage.getItem("chatbotCode");
        if (savedChatbotCode) {
          setChatbotCode(savedChatbotCode);
        }
      }
    };
    
    fetchAllData();
  }, [navigate]);

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast.info("Logout effettuato");
    navigate("/login");
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

  const renderCreatePageForm = () => {
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
                onClick={() => setUploadedImage(null)}
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
      
      setNewPage({
        title: "",
        content: "",
        path: "",
        imageUrl: "",
        icon: "FileText"
      });
      setUploadedImage(null);
      setIsList(false);
      setListItems([]);
      setListType("locations");
      setIsSubmenu(false);
      setSelectedParent("");
      
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
          isSubmenu: page.is_submenu,
          parentPath: page.parent_path
        }));
        setPages(formattedPages);
        
        const potentialParents = formattedPages.filter(page => !page.isSubmenu);
        setParentPages(potentialParents);
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

  const handleDeletePage = async (id: string) => {
    try {
      const pageToDelete = pages.find(page => page.id === id);
      if (!pageToDelete) return;
      
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      
      if (pageError) throw pageError;
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .delete()
        .eq('path', pageToDelete.path);
      
      if (iconError) throw iconError;
      
      if (!pageToDelete.isSubmenu) {
        const subPages = pages.filter(page => page.parentPath === pageToDelete.path);
        
        for (const subPage of subPages) {
          await supabase.from('custom_pages').delete().eq('id', subPage.id);
          await supabase.from('menu_icons').delete().eq('path', subPage.path);
        }
      }
      
      setPages(pages.filter(page => page.id !== id));
      
      toast.info("Pagina eliminata");
      
      if (!pageToDelete.isSubmenu) {
        setParentPages(parentPages.filter(page => page.id !== id));
      }
    } catch (error) {
      console.error("Errore nell'eliminare la pagina:", error);
      toast.error("Errore nell'eliminare la pagina");
    }
  };

  const handlePreviewPage = (path: string) => {
    navigate(`/preview/${path}`);
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

  const handleLogoUpload = (imageDataUrl: string) => {
    setUploadedLogo(imageDataUrl);
    
    const headerSettings = {
      logoUrl: imageDataUrl,
      headerColor: headerColor
    };
    localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
    
    toast.success("Logo caricato con successo");
  };

  const handleHeaderColorChange = (color: string) => {
    setHeaderColor(color);
    
    const headerSettings = {
      logoUrl: uploadedLogo,
      headerColor: color
    };
    localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
    
    toast.success("Colore dell'header aggiornato");
  };

  const renderManagePagesList = () => {
    return (
      <>
        <h2 className="text-xl font-medium text-emerald-600 mb-4">Gestisci Pagine</h2>
        
        {pages.length === 0 ? (
          <p className="text-gray-500">Nessuna pagina creata finora</p>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`${selectedColor} p-2 rounded-md`}>
                    {renderIconPreview(page.icon || "FileText")}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{page.title}</h3>
                    <p className="text-gray-500 text-sm">/{page.path}</p>
                    {page.isSubmenu && (
                      <p className="text-xs text-teal-600 mt-1">
                        Sottopagina di: {page.parentPath}
                      </p>
                    )}
                    {page.listItems && (
                      <p className="text-xs text-emerald-600 mt-1">
                        {page.listItems.length} {
                          page.listType === "restaurants" ? "ristoranti" :
                          page.listType === "activities" ? "attività" : "luoghi"
                        }
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePreviewPage(page.path)}>
                    Anteprima
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeletePage(page.id)}>
                    Elimina
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-emerald-700">Pannello Amministrazione</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Crea Pagina</TabsTrigger>
            <TabsTrigger value="manage">Gestisci Pagine</TabsTrigger>
            <TabsTrigger value="header">Personalizza Header</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <h2 className="text-xl font-medium text-emerald-600 mb-4">Crea Nuova Pagina</h2>
            {renderCreatePageForm()}
          </TabsContent>
          
          <TabsContent value="manage">
            {renderManagePagesList()}
          </TabsContent>
          
          <TabsContent value="header">
            <h2 className="text-xl font-medium text-emerald-600 mb-4">Personalizza Header</h2>
            
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-md font-medium text-emerald-700 mb-4">Logo della struttura</h3>
                <ImageUploader onImageUpload={handleLogoUpload} />
                
                {uploadedLogo && (
                  <div className="mt-4 relative">
                    <div className="p-4 bg-gray-100 rounded-md inline-block">
                      <img 
                        src={uploadedLogo} 
                        alt="Logo Anteprima" 
                        className="h-16 object-contain" 
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setUploadedLogo(null);
                        const headerSettings = {
                          logoUrl: null,
                          headerColor: headerColor
                        };
                        localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
                        toast.info("Logo rimosso");
                      }}
                    >
                      Rimuovi Logo
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-md font-medium text-emerald-700 mb-4">Colore dell'header</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {headerColorOptions.map((option) => (
                    <div 
                      key={option.value}
                      className={`cursor-pointer rounded-lg transition-all ${
                        headerColor === option.value ? 'ring-2 ring-emerald-500' : ''
                      }`}
                      onClick={() => handleHeaderColorChange(option.value)}
                    >
                      <div 
                        className={`${option.value} h-16 rounded-lg flex items-center justify-center ${
                          option.value === "bg-white" ? "border" : ""
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          option.value === "bg-white" || option.value === "bg-gradient-to-r from-amber-400 to-yellow-500" 
                            ? "text-gray-800" 
                            : "text-white"
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="text-md font-medium text-emerald-700 mb-4">Anteprima Header</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Header 
                    backgroundColor={headerColor} 
                    logoUrl={uploadedLogo || undefined}
                    showAdminButton={false} 
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chatbot">
            <h2 className="text-xl font-medium text-emerald-600 mb-4">Integrazione Chatbot</h2>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="mb-4">Inserisci qui sotto il codice di embedding del tuo chatbot:</p>
              <Textarea 
                className="font-mono text-sm h-32 mb-4"
                value={chatbotCode}
                onChange={(e) => setChatbotCode(e.target.value)}
                placeholder="<script defer id='chatbot-script' src='https://...' data-chatbot-id='...'></script>"
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveChatbotCode}>Salva Configurazione Chatbot</Button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Istruzioni per il chatbot:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Copia il codice di embedding fornito dal tuo provider di chatbot.</li>
                  <li>Incolla il codice nel campo di testo sopra.</li>
                  <li>Clicca su "Salva Configurazione Chatbot".</li>
                  <li>Il chatbot sarà visibile in tutte le pagine del tuo sito.</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
