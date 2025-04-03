
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
import { supabase } from "@/integrations/supabase/client"; // Fixed import path

// Import the refactored components
import { CreatePageForm } from "@/components/admin/CreatePageForm";
import { ManagePagesView } from "@/components/admin/ManagePagesView";
import { HeaderSettingsView } from "@/components/admin/HeaderSettingsView";
import { ChatbotSettingsView } from "@/components/admin/ChatbotSettingsView";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

interface LocationItem {
  name: string;
  description?: string;
  phoneNumber?: string;
  mapsUrl?: string;
}

export interface PageData {
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

const Admin: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [headerColor, setHeaderColor] = useState<string>("bg-gradient-to-r from-teal-500 to-emerald-600");
  const [chatbotCode, setChatbotCode] = useState<string>("");
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  
  const navigate = useNavigate();
  const keywordToIconMap = useKeywordToIconMap();

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
            isSubmenu: page.is_submenu || false,
            parentPath: page.parent_path || undefined
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast.info("Logout effettuato");
    navigate("/login");
  };

  const handleSaveChatbotCode = async () => {
    try {
      // Check if there's an existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('chatbot_settings')
        .select('*')
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      let saveOperation;
      if (existingData && existingData.length > 0) {
        // Update existing record
        saveOperation = supabase
          .from('chatbot_settings')
          .update({ code: chatbotCode })
          .eq('id', existingData[0].id);
      } else {
        // Insert new record
        saveOperation = supabase
          .from('chatbot_settings')
          .insert({ code: chatbotCode });
      }
      
      const { error: saveError } = await saveOperation;
      if (saveError) throw saveError;
      
      localStorage.setItem("chatbotCode", chatbotCode);
      toast.success("Configurazione chatbot salvata con successo");
    } catch (error) {
      console.error("Errore nel salvare la configurazione chatbot:", error);
      toast.error("Errore nel salvare la configurazione chatbot");
    }
  };

  const updatePagesList = (newPages: PageData[]) => {
    setPages(newPages);
    const potentialParents = newPages.filter(page => !page.isSubmenu);
    setParentPages(potentialParents);
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
            <CreatePageForm 
              parentPages={parentPages} 
              onPageCreated={updatePagesList} 
              keywordToIconMap={keywordToIconMap}
            />
          </TabsContent>
          
          <TabsContent value="manage">
            <ManagePagesView pages={pages} onPagesUpdate={updatePagesList} />
          </TabsContent>
          
          <TabsContent value="header">
            <HeaderSettingsView 
              uploadedLogo={uploadedLogo}
              setUploadedLogo={setUploadedLogo}
              headerColor={headerColor}
              setHeaderColor={setHeaderColor}
            />
          </TabsContent>
          
          <TabsContent value="chatbot">
            <ChatbotSettingsView 
              chatbotCode={chatbotCode}
              setChatbotCode={setChatbotCode}
              onSave={handleSaveChatbotCode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
