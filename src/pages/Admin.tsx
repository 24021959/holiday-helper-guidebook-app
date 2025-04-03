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
  Newspaper, PawPrint, Heart, Bookmark, ShoppingBag
} from "lucide-react";
import BackToMenu from "@/components/BackToMenu";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import ImageUploader from "@/components/ImageUploader";

interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  icon?: string;
  mapsUrl?: string;
  phoneNumber?: string;
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
    mapsUrl: "",
    phoneNumber: ""
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatbotCode, setChatbotCode] = useState<string>("");
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
  
  const [selectedColor, setSelectedColor] = useState("bg-blue-200");

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      navigate("/login");
    }
    
    const savedPages = localStorage.getItem("customPages");
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    }
    
    const savedChatbotCode = localStorage.getItem("chatbotCode");
    if (savedChatbotCode) {
      setChatbotCode(savedChatbotCode);
    }
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

  const handleSavePage = () => {
    if (!newPage.title || !newPage.content) {
      toast.error("Titolo e contenuto sono obbligatori");
      return;
    }

    const pageId = `page_${Date.now()}`;
    
    const pageToSave: PageData = { 
      ...newPage, 
      id: pageId,
      imageUrl: uploadedImage || newPage.imageUrl,
      path: newPage.path || generateSlugFromTitle(newPage.title)
    };
    
    const updatedPages = [...pages, pageToSave];
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    
    addIconToMenu(pageToSave);
    
    toast.success("Pagina creata con successo!");
    
    setNewPage({
      title: "",
      content: "",
      path: "",
      imageUrl: "",
      icon: "FileText",
      mapsUrl: "",
      phoneNumber: ""
    });
    setUploadedImage(null);
  };

  const addIconToMenu = (page: PageData) => {
    const currentIconsJson = localStorage.getItem("menuIcons");
    const currentIcons: MenuIcon[] = currentIconsJson ? JSON.parse(currentIconsJson) : [];
    
    const newIcon: MenuIcon = {
      icon: page.icon || "FileText",
      label: page.title,
      bgColor: selectedColor,
      path: `/${page.path}`
    };
    
    const updatedIcons = [...currentIcons, newIcon];
    
    localStorage.setItem("menuIcons", JSON.stringify(updatedIcons));
    
    toast.success("Icona aggiunta al menu");
  };

  const handleDeletePage = (id: string) => {
    const pageToDelete = pages.find(page => page.id === id);
    
    const updatedPages = pages.filter(page => page.id !== id);
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    
    if (pageToDelete) {
      removeIconFromMenu(pageToDelete.path);
    }
    
    toast.info("Pagina eliminata");
  };

  const removeIconFromMenu = (pagePath: string) => {
    const currentIconsJson = localStorage.getItem("menuIcons");
    if (currentIconsJson) {
      const currentIcons: MenuIcon[] = JSON.parse(currentIconsJson);
      const updatedIcons = currentIcons.filter(icon => icon.path !== `/${pagePath}`);
      localStorage.setItem("menuIcons", JSON.stringify(updatedIcons));
    }
  };

  const handleSaveChatbotCode = () => {
    localStorage.setItem("chatbotCode", chatbotCode);
    toast.success("Codice chatbot salvato con successo!");
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
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <h2 className="text-xl font-medium text-emerald-600 mb-4">Crea Nuova Pagina</h2>
            
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
              
              <div>
                <Label htmlFor="mapsUrl">Link a Google Maps</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Input 
                    id="mapsUrl" 
                    value={newPage.mapsUrl || ""} 
                    onChange={(e) => setNewPage({...newPage, mapsUrl: e.target.value})}
                    placeholder="https://maps.google.com/?q=..."
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inserisci il link a Google Maps per indicare la posizione
                </p>
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Numero di Telefono</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <Input 
                    id="phoneNumber" 
                    value={newPage.phoneNumber || ""} 
                    onChange={(e) => setNewPage({...newPage, phoneNumber: e.target.value})}
                    placeholder="+39 123 456 7890"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inserisci il numero di telefono completo di prefisso internazionale (es. +39)
                </p>
              </div>
              
              <Button onClick={handleSavePage}>Salva Pagina</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manage">
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
