
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementView } from "@/components/admin/UserManagementView";
import { ManagePagesView } from "@/components/admin/ManagePagesView"; 
import { HeaderSettingsView } from "@/components/admin/HeaderSettingsView";
import { ChatbotSettingsView } from "@/components/admin/ChatbotSettingsView";
import { CreatePageForm } from "@/components/admin/CreatePageForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

export interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  icon?: string;
  isSubmenu?: boolean;
  parentPath?: string | null;
  listItems?: any[];
  listType?: 'restaurants' | 'activities' | 'locations';
}

export interface UserData {
  id: string;
  email: string;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export interface LocationItem {
  name: string;
  description: string;
  imageUrl?: string;
}

const Admin: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [headerColor, setHeaderColor] = useState<string>("bg-gradient-to-r from-teal-500 to-emerald-600");
  const [chatbotCode, setChatbotCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("create-page");
  const navigate = useNavigate();
  const location = useLocation();
  const keywordToIconMap = useKeywordToIconMap();
  const isMaster = localStorage.getItem("user_role") === "master";
  
  // Imposta la scheda attiva in base ai parametri URL o al ruolo dell'utente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (isMaster) {
      setActiveTab("user-management");
    }
  }, [location.search, isMaster]);
  
  // Fetch all pages 
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          const formattedPages: PageData[] = data.map(page => ({
            id: page.id,
            title: page.title,
            content: page.content,
            path: page.path,
            imageUrl: page.image_url,
            icon: page.icon,
            isSubmenu: page.is_submenu,
            parentPath: page.parent_path,
            listItems: Array.isArray(page.list_items) ? page.list_items : [],
            listType: page.list_type as 'restaurants' | 'activities' | 'locations'
          }));
          setPages(formattedPages);
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
        toast.error("Errore nel recupero delle pagine");
      }
    };
    
    if (isAuthenticated && !isMaster) {
      fetchPages();
    }
  }, [isAuthenticated, isMaster]);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For this demo, we'll use localStorage to check if admin is logged in
        const adminToken = localStorage.getItem("admin_token");
        
        if (!adminToken) {
          navigate("/login");
          return;
        }
        
        // Simple validation, could be enhanced with supabase auth
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handlePageCreated = (newPages: PageData[]) => {
    setPages(newPages);
  };
  
  const handlePagesUpdate = (updatedPages: PageData[]) => {
    setPages(updatedPages);
  };
  
  const handleSaveChatbotSettings = async () => {
    // Implementation for saving chatbot settings
    toast.success("Impostazioni chatbot salvate");
    return Promise.resolve();
  };
  
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("user_role");
    toast.success("Logout eseguito con successo");
    navigate("/login");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  // Get only parent pages (non-submenu pages)
  const parentPages = pages.filter(page => !page.isSubmenu);
  
  // Determina il testo del titolo in base al ruolo dell'utente
  const panelTitle = isMaster ? "Pannello Master" : "Pannello Amministratore";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`bg-white shadow-sm border-b ${isMaster ? "bg-gradient-to-r from-purple-500 to-indigo-600" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className={`text-xl font-semibold ${isMaster ? "text-white" : "text-gray-900"}`}>{panelTitle}</h1>
            <button 
              onClick={handleLogout}
              className={`px-3 py-1 ${isMaster ? "bg-white text-purple-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"} rounded text-sm`}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isMaster ? (
          // Se è un utente Master, mostra solo la gestione utenti
          <div className="bg-white shadow-md rounded-md p-6 border">
            <h2 className="text-xl font-medium text-purple-600 mb-6">Gestione Utenti (Pannello Master)</h2>
            <UserManagementView />
          </div>
        ) : (
          // Se è un utente normale Admin, mostra tutti i tab
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 w-full justify-start border-b rounded-none bg-transparent h-auto pb-0">
              <TabsTrigger 
                value="create-page"
                className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
              >
                Crea Pagina
              </TabsTrigger>
              <TabsTrigger 
                value="manage-pages"
                className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
              >
                Gestisci Pagine
              </TabsTrigger>
              <TabsTrigger 
                value="header-settings"
                className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
              >
                Impostazioni Header
              </TabsTrigger>
              <TabsTrigger 
                value="chatbot-settings"
                className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
              >
                Impostazioni Chatbot
              </TabsTrigger>
              <TabsTrigger 
                value="user-management"
                className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
              >
                Gestione Utenti
              </TabsTrigger>
            </TabsList>
            
            <div className="bg-white shadow-md rounded-md p-6 border">
              <TabsContent value="create-page">
                <CreatePageForm 
                  parentPages={parentPages} 
                  onPageCreated={handlePageCreated}
                  keywordToIconMap={keywordToIconMap}
                />
              </TabsContent>
              
              <TabsContent value="manage-pages">
                <ManagePagesView 
                  pages={pages} 
                  onPagesUpdate={handlePagesUpdate}
                />
              </TabsContent>
              
              <TabsContent value="header-settings">
                <HeaderSettingsView 
                  uploadedLogo={uploadedLogo}
                  setUploadedLogo={setUploadedLogo}
                  headerColor={headerColor}
                  setHeaderColor={setHeaderColor}
                />
              </TabsContent>
              
              <TabsContent value="chatbot-settings">
                <ChatbotSettingsView 
                  chatbotCode={chatbotCode}
                  setChatbotCode={setChatbotCode}
                  onSave={handleSaveChatbotSettings}
                />
              </TabsContent>
              
              <TabsContent value="user-management">
                <UserManagementView />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Admin;
