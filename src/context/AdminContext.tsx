
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
  userRole: string | null;
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
  const [userRole, setUserRole] = useState<string | null>(null);

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
      const storedUserRole = localStorage.getItem("user_role");
      
      console.log("Local auth check:", { isAuthenticated, adminToken, storedUserRole });
      
      if (isAuthenticated && adminToken) {
        // Demo or local authentication is valid
        console.log("User authenticated via localStorage");
        
        // Set user role from localStorage
        setUserRole(storedUserRole);
        
        // If master role, show master panel
        if (storedUserRole === "master") {
          setShowMasterPanel(true);
          setActiveTab("user-management");
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
        // If table doesn't exist, we're in demo mode and need to use fallback data
        if (error.code === '42P01') {
          console.warn("Pages table doesn't exist, using demo data");
          
          // Demo data - create some example pages
          const demoPages: PageData[] = [
            {
              id: "1",
              title: "Home",
              content: "<p>Welcome to our site!</p>",
              path: "home",
              icon: "Home",
              isSubmenu: false,
              pageImages: [],
              published: true,
              is_parent: false
            },
            {
              id: "2",
              title: "About",
              content: "<p>About our company</p>",
              path: "about",
              icon: "Info",
              isSubmenu: false,
              pageImages: [],
              published: true,
              is_parent: false
            }
          ];
          
          setPages(demoPages);
          setParentPages([]);
          setIsLoading(false);
          return;
        }
        
        console.error("Errore nel recupero delle pagine:", error);
        setError(error.message);
        setIsLoading(false);
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
        // Don't show error toast for this issue as it's not critical
        
        if (error.code === '42P01') {
          // Table doesn't exist, we're in demo mode - create a default map
          const defaultMap: Record<string, string> = {
            "home": "Home",
            "about": "Info",
            "contact": "Phone",
            "services": "Settings",
            "products": "ShoppingCart",
            "news": "Newspaper",
            "blog": "FileText",
            "events": "Calendar",
            "faq": "HelpCircle",
            "gallery": "Image",
            "team": "Users",
            "testimonials": "Quote",
            "pricing": "DollarSign",
            "login": "LogIn",
            "register": "UserPlus"
          };
          
          setKeywordToIconMap(defaultMap);
        }
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
      // Don't show error toast for this issue as it's not critical
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
    userRole,
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
