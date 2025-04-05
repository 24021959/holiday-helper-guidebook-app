
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

import AdminPanel from "@/components/admin/AdminPanel";
import MasterPanel from "@/components/admin/MasterPanel";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoader from "@/components/admin/AdminLoader";

export interface ImageItem {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  type: "image";
}

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
  pageImages?: ImageItem[];
  published?: boolean;
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
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (isMaster) {
      setActiveTab("user-management");
    }
  }, [location.search, isMaster]);
  
  useEffect(() => {
    const fetchChatbotSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('chatbot_settings')
          .select('code')
          .eq('id', 1)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.warn("Errore nel caricamento delle impostazioni chatbot:", error);
          return;
        }
        
        if (data) {
          setChatbotCode(data.code || "");
          localStorage.setItem("chatbotCode", data.code || "");
        }
      } catch (error) {
        console.error("Error fetching chatbot settings:", error);
      }
    };
    
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
            listType: page.list_type as 'restaurants' | 'activities' | 'locations',
            pageImages: page.page_images ? page.page_images as ImageItem[] : [],
            published: page.published || false
          }));
          setPages(formattedPages);
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
        toast.error("Errore nel recupero delle pagine");
      }
    };
    
    if (isAuthenticated) {
      if (!isMaster) {
        fetchPages();
      }
      fetchChatbotSettings();
    }
  }, [isAuthenticated, isMaster]);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminToken = localStorage.getItem("admin_token");
        
        if (!adminToken) {
          navigate("/login");
          return;
        }
        
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
    try {
      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({ id: 1, code: chatbotCode })
        .select();

      if (error) throw error;
      
      localStorage.setItem("chatbotCode", chatbotCode);
      
      toast.success("Impostazioni chatbot salvate con successo");
      return Promise.resolve();
    } catch (error) {
      console.error("Errore nel salvataggio delle impostazioni chatbot:", error);
      toast.error("Errore nel salvataggio delle impostazioni chatbot");
      return Promise.reject(error);
    }
  };
  
  if (isLoading) {
    return <AdminLoader />;
  }
  
  if (!isAuthenticated) {
    return null;
  }

  const parentPages = pages.filter(page => !page.isSubmenu);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader isMaster={isMaster} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isMaster ? (
          <MasterPanel />
        ) : (
          <AdminPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pages={pages}
            parentPages={parentPages}
            uploadedLogo={uploadedLogo}
            setUploadedLogo={setUploadedLogo}
            headerColor={headerColor}
            setHeaderColor={setHeaderColor}
            chatbotCode={chatbotCode}
            setChatbotCode={setChatbotCode}
            handlePageCreated={handlePageCreated}
            handlePagesUpdate={handlePagesUpdate}
            handleSaveChatbotSettings={handleSaveChatbotSettings}
            keywordToIconMap={keywordToIconMap}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
