
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackToMenu from "@/components/BackToMenu";

interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
}

const Admin: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [newPage, setNewPage] = useState<Omit<PageData, 'id'>>({
    title: "",
    content: "",
    path: "",
    imageUrl: ""
  });
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  // Simulazione autenticazione (da sostituire con un vero sistema di autenticazione)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo credentials
    if (username === "admin" && password === "password") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      toast.success("Login effettuato con successo!");
    } else {
      toast.error("Credenziali non valide");
    }
  };

  // Controlla se l'utente è già autenticato
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    
    // Carica le pagine dal localStorage
    const savedPages = localStorage.getItem("customPages");
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    }
  }, []);

  // Gestione logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast.info("Logout effettuato");
  };

  // Salva una nuova pagina
  const handleSavePage = () => {
    if (!newPage.title || !newPage.path || !newPage.content) {
      toast.error("Tutti i campi sono obbligatori");
      return;
    }

    const pageId = `page_${Date.now()}`;
    const updatedPages = [...pages, { ...newPage, id: pageId }];
    
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    
    toast.success("Pagina creata con successo!");
    
    // Reset form
    setNewPage({
      title: "",
      content: "",
      path: "",
      imageUrl: ""
    });
  };

  // Eliminare una pagina
  const handleDeletePage = (id: string) => {
    const updatedPages = pages.filter(page => page.id !== id);
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    toast.info("Pagina eliminata");
  };

  // Visualizza la pagina in anteprima
  const handlePreviewPage = (path: string) => {
    navigate(`/preview/${path}`);
  };

  // Se l'utente non è autenticato, mostra il form di login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-emerald-700 mb-6">Accesso Amministrazione</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            <Button type="submit" className="w-full">Accedi</Button>
          </form>
        </div>
      </div>
    );
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
              <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="imageUrl">URL Immagine (opzionale)</Label>
                <Input 
                  id="imageUrl" 
                  value={newPage.imageUrl} 
                  onChange={(e) => setNewPage({...newPage, imageUrl: e.target.value})}
                  placeholder="https://esempio.com/immagine.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Contenuto Pagina</Label>
                <textarea 
                  id="content"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[200px]"
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
                    <div>
                      <h3 className="font-medium text-lg">{page.title}</h3>
                      <p className="text-gray-500 text-sm">/{page.path}</p>
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
              <p className="mb-4">Il tuo chatbot è configurato e pronto all'uso. Puoi visualizzarlo nella sezione di anteprima.</p>
              <div className="p-4 bg-gray-100 rounded-lg">
                <code className="text-sm">
                  &lt;script defer id="chatbot-script" src="https://cdn.aichatbotjs.com/chatbot.js" data-chatbot-id="bot-ufqmgj3gyj"&gt;&lt;/script&gt;
                </code>
              </div>
              <Button className="mt-4">Test Chatbot</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
