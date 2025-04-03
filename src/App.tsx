import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BackToMenu from "@/components/BackToMenu";
import ChatbotBubble from "@/components/ChatbotBubble";

import Home from "./pages/Home";
import Menu from "@/pages/Menu";
import Admin from "@/pages/Admin";
import Welcome from "@/pages/Welcome";
import Storia from "@/pages/Storia";
import SubMenu from "@/pages/SubMenu";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

interface CustomPage {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  isSubmenu?: boolean;
  parentPath?: string | null;
}

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
}

const PlaceholderPage = ({ title }: { title: string }) => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setHeaderSettings({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
          });
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
        
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeaderSettings();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }
  
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

const DynamicPage = ({ pageData }: { pageData: CustomPage }) => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const [hasSubmenuPages, setHasSubmenuPages] = useState(false);
  
  useEffect(() => {
    const checkForSubmenuPages = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_icons')
          .select('id')
          .eq('parent_path', pageData.path)
          .limit(1);
          
        if (error) throw error;
        
        setHasSubmenuPages(data && data.length > 0);
      } catch (error) {
        console.error("Errore nel controllo delle sottopagine:", error);
      }
    };
    
    const fetchHeaderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setHeaderSettings({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
          });
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
        
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    Promise.all([checkForSubmenuPages(), fetchHeaderSettings()]);
  }, [pageData.path]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }
  
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
        
        {hasSubmenuPages && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-center">
              <a 
                href={`/submenu/${pageData.path.replace('/', '')}`} 
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-teal-700 transition-colors"
              >
                Esplora {pageData.title}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const hasSelectedLanguage = localStorage.getItem("selectedLanguage") !== null;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: pagesData, error: pagesError } = await supabase
          .from('custom_pages')
          .select('*');
        
        if (pagesError) throw pagesError;
        
        if (pagesData) {
          const formattedPages: CustomPage[] = pagesData.map(page => ({
            id: page.id,
            title: page.title,
            content: page.content,
            path: page.path,
            imageUrl: page.image_url,
            isSubmenu: page.is_submenu,
            parentPath: page.parent_path
          }));
          setCustomPages(formattedPages);
        }
        
        const { data: headerData, error: headerError } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (headerError) throw headerError;
        
        if (headerData) {
          setHeaderSettings({
            logoUrl: headerData.logo_url,
            headerColor: headerData.header_color,
          });
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        
        const savedPages = localStorage.getItem("customPages");
        if (savedPages) {
          try {
            setCustomPages(JSON.parse(savedPages));
          } catch (err) {
            console.error("Errore nel parsing delle pagine dal localStorage:", err);
          }
        }
        
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto" />
          <p className="mt-4 text-emerald-700">Caricamento applicazione...</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/menu" 
              element={
                localStorage.getItem("isAuthenticated") === "true" ? 
                <Menu /> : <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin" 
              element={
                localStorage.getItem("isAuthenticated") === "true" && 
                localStorage.getItem("userType") === "admin" ? 
                <Admin /> : <Navigate to="/" />
              } 
            />
            
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/storia" element={<Storia />} />
            <Route path="/index" element={<Index />} />
            
            <Route path="/submenu/:parentPath" element={<SubMenu />} />
            
            {customPages.map((page) => (
              <Route 
                key={page.id} 
                path={page.path} 
                element={<DynamicPage pageData={page} />} 
              />
            ))}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotBubble />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
