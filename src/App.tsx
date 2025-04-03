
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import BackToMenu from "./components/BackToMenu";
import Welcome from "./pages/Welcome";
import Storia from "./pages/Storia";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import PreviewPage from "./pages/PreviewPage";
import ChatbotBubble from "./components/ChatbotBubble";
import Header from "./components/Header";

interface CustomPage {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
}

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
}

// Create placeholder pages for each menu item
const PlaceholderPage = ({ title }: { title: string }) => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  
  useEffect(() => {
    const savedHeaderSettings = localStorage.getItem("headerSettings");
    if (savedHeaderSettings) {
      setHeaderSettings(JSON.parse(savedHeaderSettings));
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">{title}</h1>
        <p className="text-gray-600">
          Contenuto della pagina {title} in arrivo...
        </p>
      </div>
    </div>
  );
};

// Componente per pagine dinamiche
const DynamicPage = ({ pageData }: { pageData: CustomPage }) => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  
  useEffect(() => {
    const savedHeaderSettings = localStorage.getItem("headerSettings");
    if (savedHeaderSettings) {
      setHeaderSettings(JSON.parse(savedHeaderSettings));
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">{pageData.title}</h1>
        
        {pageData.imageUrl && (
          <div className="mb-6">
            <img 
              src={pageData.imageUrl} 
              alt={pageData.title} 
              className="w-full h-auto rounded-lg object-cover max-h-80"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/800x400?text=Immagine+non+disponibile";
              }}
            />
          </div>
        )}
        
        <div className="text-gray-600 prose">
          {pageData.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const hasSelectedLanguage = localStorage.getItem("selectedLanguage") !== null;
  
  // Carica le pagine personalizzate e le impostazioni dell'header dal localStorage
  useEffect(() => {
    const savedPages = localStorage.getItem("customPages");
    if (savedPages) {
      try {
        setCustomPages(JSON.parse(savedPages));
      } catch (error) {
        console.error("Errore nel caricamento delle pagine personalizzate:", error);
      }
    }
    
    const savedHeaderSettings = localStorage.getItem("headerSettings");
    if (savedHeaderSettings) {
      try {
        setHeaderSettings(JSON.parse(savedHeaderSettings));
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
      }
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={hasSelectedLanguage ? <Menu /> : <Navigate to="/" />} />
            
            {/* Routes for each icon */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/storia" element={<Storia />} />
            <Route path="/servizi-hotel" element={<PlaceholderPage title="Servizi hotel" />} />
            <Route path="/servizi-esterni" element={<PlaceholderPage title="Servizi esterni" />} />
            <Route path="/ristorante" element={<PlaceholderPage title="Ristorante" />} />
            <Route path="/scopri-territorio" element={<PlaceholderPage title="Scopri il territorio" />} />
            <Route path="/location" element={<PlaceholderPage title="Posizione" />} />
            <Route path="/wifi" element={<PlaceholderPage title="Wifi" />} />
            <Route path="/activities" element={<PlaceholderPage title="Attività" />} />
            <Route path="/transport" element={<PlaceholderPage title="Trasporti" />} />
            <Route path="/shopping" element={<PlaceholderPage title="Shopping" />} />
            <Route path="/contacts" element={<PlaceholderPage title="Contatti" />} />
            <Route path="/events" element={<PlaceholderPage title="Eventi" />} />
            <Route path="/gallery" element={<PlaceholderPage title="Galleria" />} />
            <Route path="/info" element={<PlaceholderPage title="Info" />} />
            
            {/* Rotte dinamiche per le pagine personalizzate */}
            {customPages.map((page) => (
              <Route 
                key={page.id} 
                path={`/${page.path}`} 
                element={<DynamicPage pageData={page} />} 
              />
            ))}
            
            {/* Admin routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/preview/:pageSlug" element={<PreviewPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotBubble />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
