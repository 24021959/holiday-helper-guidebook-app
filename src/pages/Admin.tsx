
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, FileImage, MessageCircle } from "lucide-react";
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
}

interface MenuIcon {
  icon: string;
  label: string;
  bgColor: string;
  path: string;
}

const Admin: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [newPage, setNewPage] = useState<Omit<PageData, 'id'>>({
    title: "",
    content: "",
    path: "",
    imageUrl: "",
    icon: "FileText"
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatbotCode, setChatbotCode] = useState<string>("");
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      title: "",
      path: "",
      content: "",
      icon: "FileText",
    }
  });

  // Opzioni di icone disponibili
  const availableIcons = [
    { name: "FileText", label: "Documento" },
    { name: "Image", label: "Immagine" },
    { name: "MessageCircle", label: "Chat" },
    { name: "Info", label: "Informazione" },
    { name: "Map", label: "Mappa" }
  ];

  // Colori di sfondo disponibili per le icone
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

  // Controlla se l'utente è già autenticato
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      // Reindirizza alla pagina di login se non autenticato
      navigate("/login");
    }
    
    // Carica le pagine dal localStorage
    const savedPages = localStorage.getItem("customPages");
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    }
    
    // Carica il codice chatbot dal localStorage
    const savedChatbotCode = localStorage.getItem("chatbotCode");
    if (savedChatbotCode) {
      setChatbotCode(savedChatbotCode);
    }
  }, [navigate]);

  // Gestione logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast.info("Logout effettuato");
    navigate("/login");
  };

  // Gestione caricamento immagine
  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setNewPage({...newPage, imageUrl: imageDataUrl});
    toast.success("Immagine caricata con successo");
  };

  // Salva una nuova pagina e aggiunge l'icona al menu
  const handleSavePage = () => {
    if (!newPage.title || !newPage.path || !newPage.content) {
      toast.error("Titolo, URL e contenuto sono obbligatori");
      return;
    }

    // Genera un ID univoco per la pagina
    const pageId = `page_${Date.now()}`;
    
    // Salva la nuova pagina
    const pageToSave: PageData = { 
      ...newPage, 
      id: pageId,
      imageUrl: uploadedImage || newPage.imageUrl
    };
    
    const updatedPages = [...pages, pageToSave];
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    
    // Aggiungi l'icona al menu
    addIconToMenu(pageToSave);
    
    toast.success("Pagina creata con successo!");
    
    // Reset form
    setNewPage({
      title: "",
      content: "",
      path: "",
      imageUrl: "",
      icon: "FileText"
    });
    setUploadedImage(null);
  };

  // Aggiunge l'icona al menu
  const addIconToMenu = (page: PageData) => {
    // Recupera l'array di icone attuale dal localStorage
    const currentIconsJson = localStorage.getItem("menuIcons");
    const currentIcons: MenuIcon[] = currentIconsJson ? JSON.parse(currentIconsJson) : [];
    
    // Crea la nuova icona
    const newIcon: MenuIcon = {
      icon: page.icon || "FileText", // Usa l'icona selezionata o default
      label: page.title,
      bgColor: selectedColor,
      path: `/${page.path}`
    };
    
    // Aggiungi la nuova icona all'array
    const updatedIcons = [...currentIcons, newIcon];
    
    // Salva l'array aggiornato
    localStorage.setItem("menuIcons", JSON.stringify(updatedIcons));
    
    toast.success("Icona aggiunta al menu");
  };

  // Eliminare una pagina
  const handleDeletePage = (id: string) => {
    // Trova la pagina per rimuoverla anche dal menu
    const pageToDelete = pages.find(page => page.id === id);
    
    // Rimuovi la pagina dall'array
    const updatedPages = pages.filter(page => page.id !== id);
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    
    // Rimuovi anche l'icona dal menu se la pagina esiste
    if (pageToDelete) {
      removeIconFromMenu(pageToDelete.path);
    }
    
    toast.info("Pagina eliminata");
  };

  // Rimuove l'icona dal menu
  const removeIconFromMenu = (pagePath: string) => {
    // Recupera l'array di icone attuale dal localStorage
    const currentIconsJson = localStorage.getItem("menuIcons");
    if (currentIconsJson) {
      const currentIcons: MenuIcon[] = JSON.parse(currentIconsJson);
      // Rimuovi l'icona con il path corrispondente
      const updatedIcons = currentIcons.filter(icon => icon.path !== `/${pagePath}`);
      // Salva l'array aggiornato
      localStorage.setItem("menuIcons", JSON.stringify(updatedIcons));
    }
  };

  // Salva il codice del chatbot
  const handleSaveChatbotCode = () => {
    localStorage.setItem("chatbotCode", chatbotCode);
    toast.success("Codice chatbot salvato con successo!");
  };

  // Visualizza la pagina in anteprima
  const handlePreviewPage = (path: string) => {
    navigate(`/preview/${path}`);
  };

  // Se c'è un problema di autenticazione, non mostriamo nulla durante il reindirizzamento
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titolo Pagina</Label>
                  <Input 
                    id="title" 
                    value={newPage.title} 
                    onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                    placeholder="Titolo della pagina"
                  />
                </div>
                <div>
                  <Label htmlFor="path">URL Pagina (senza /)</Label>
                  <Input 
                    id="path" 
                    value={newPage.path} 
                    onChange={(e) => setNewPage({...newPage, path: e.target.value})}
                    placeholder="nome-pagina"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="icon">Icona per il Menu</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                  {availableIcons.map((icon) => (
                    <div 
                      key={icon.name} 
                      className={`flex flex-col items-center p-2 rounded-md cursor-pointer ${newPage.icon === icon.name ? 'bg-emerald-100 border border-emerald-300' : 'hover:bg-gray-100'}`}
                      onClick={() => setNewPage({...newPage, icon: icon.name})}
                    >
                      {icon.name === "FileText" && <FileImage className="w-6 h-6" />}
                      {icon.name === "Image" && <Image className="w-6 h-6" />}
                      {icon.name === "MessageCircle" && <MessageCircle className="w-6 h-6" />}
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
                        {page.icon === "FileText" && <FileImage className="w-5 h-5" />}
                        {page.icon === "Image" && <Image className="w-5 h-5" />}
                        {page.icon === "MessageCircle" && <MessageCircle className="w-5 h-5" />}
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
