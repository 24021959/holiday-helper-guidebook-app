
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string | null;
  icon?: string;
  listType?: "locations" | "activities" | "restaurants" | undefined;
  listItems?: { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined;
  isSubmenu: boolean;
  parentPath?: string | null;
  pageImages: any[];
  published: boolean;
  is_parent: boolean;
}

export interface UserData {
  id: string;
  email: string;
  isActive: boolean;
  role: string;
  createdAt: string;
}

interface AdminContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pages: PageData[];
  setPages: React.Dispatch<React.SetStateAction<PageData[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  keywordToIconMap: Record<string, string>;
  setKeywordToIconMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  parentPages: PageData[];
  setParentPages: React.Dispatch<React.SetStateAction<PageData[]>>;
  showMasterPanel: boolean;
  setShowMasterPanel: React.Dispatch<React.SetStateAction<boolean>>;
  handlePagesUpdate: (updatedPages: PageData[]) => void;
  fetchPages: () => Promise<void>;
  fetchKeywordToIconMap: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("pages");
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywordToIconMap, setKeywordToIconMap] = useState<Record<string, string>>({});
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const [showMasterPanel, setShowMasterPanel] = useState(false);

  useEffect(() => {
    try {
      console.log("Admin page mounted");
      checkAdminAccess();
      fetchPages();
      fetchKeywordToIconMap();
    } catch (err: any) {
      console.error("Error in Admin page initialization:", err);
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  }, []);

  const checkAdminAccess = async () => {
    try {
      // First check localStorage-based auth for demo mode
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      const adminToken = localStorage.getItem("admin_token");
      const userRole = localStorage.getItem("user_role");
      
      console.log("Local auth check:", { isAuthenticated, adminToken, userRole });
      
      if (isAuthenticated && adminToken) {
        // Demo or local authentication is valid
        console.log("User authenticated via localStorage");
        
        // If master role, show master panel
        if (userRole === "master") {
          setShowMasterPanel(true);
        }
        
        return; // Auth successful, exit early
      }
      
      // If no local auth, try Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No valid auth found - redirecting to login");
        toast.error("Accesso negato. Effettua il login");
        navigate("/login");
        return;
      }
      
      console.log("User session verified via Supabase");
    } catch (err) {
      console.error("Error checking admin access:", err);
      toast.error("Errore nel controllo dell'accesso");
      navigate("/login");
    }
  };

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*');

      if (error) {
        console.error("Errore nel recupero delle pagine:", error);
        setError(error.message);
        return;
      }

      if (data) {
        const formattedPages = data.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined,
          pageImages: [],
          published: page.published || false,
          is_parent: false
        }));
        
        setPages(formattedPages);
        
        const parents = formattedPages.filter(page => page.content === "" && page.imageUrl === null);
        setParentPages(parents);
        
        console.log("Pagine caricate:", formattedPages.length);
      }
    } catch (err: any) {
      console.error("Errore durante il recupero delle pagine:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKeywordToIconMap = async () => {
    try {
      const { data, error } = await supabase
        .from('keyword_to_icon')
        .select('*');

      if (error) {
        console.error("Errore nel recupero della mappa keyword-icon:", error);
        toast.error("Errore nel caricamento della configurazione");
        return;
      }

      if (data) {
        const map: Record<string, string> = {};
        data.forEach(item => {
          map[item.keyword] = item.icon;
        });
        setKeywordToIconMap(map);
        console.log("Mappa keyword-icon caricata:", Object.keys(map).length);
      }
    } catch (err: any) {
      console.error("Errore durante il recupero della mappa keyword-icon:", err);
      toast.error("Errore nel caricamento della configurazione");
    }
  };

  const handlePagesUpdate = (updatedPages: PageData[]) => {
    setPages(updatedPages);
    
    const parents = updatedPages.filter(page => page.content === "" && page.imageUrl === null);
    setParentPages(parents);
  };

  const value = {
    activeTab,
    setActiveTab,
    pages,
    setPages,
    isLoading,
    setIsLoading,
    error,
    setError,
    keywordToIconMap,
    setKeywordToIconMap,
    parentPages,
    setParentPages,
    showMasterPanel,
    setShowMasterPanel,
    handlePagesUpdate,
    fetchPages,
    fetchKeywordToIconMap
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
