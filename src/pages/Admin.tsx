import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  is_parent?: boolean;
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
  const [activeTab, setActiveTab] = useState<string>("create-page");
  const [loadError, setLoadError] = useState<string | null>(null);
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
  
  const safelyStorePagesInLocalStorage = (pagesData: PageData[]): boolean => {
    try {
      const pagesString = JSON.stringify(pagesData);
      const sizeInMB = (pagesString.length * 2) / (1024 * 1024);
      
      if (sizeInMB > 4) {
        console.warn("Pages data too large for localStorage (approx " + sizeInMB.toFixed(2) + "MB)");
        return false;
      }
      
      localStorage.setItem('cached_pages', pagesString);
      return true;
    } catch (e) {
      console.warn("Failed to cache pages in localStorage:", e);
      return false;
    }
  };
  
  const fetchPages = async () => {
    try {
      setLoadError(null);
      console.log("Admin - Fetching pages from database");
      
      try {
        const cachedPagesString = localStorage.getItem('cached_pages');
        if (cachedPagesString) {
          const cachedPages = JSON.parse(cachedPagesString);
          console.log("Admin - Using cached pages temporarily:", cachedPages.length);
          setPages(cachedPages);
        }
      } catch (err) {
        console.error("Error parsing cached pages:", err);
      }
      
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedPages: PageData[] = data.map(page => {
          let pageImages: ImageItem[] = [];
          
          try {
            if (page.content && page.content.includes('<!-- IMAGES -->')) {
              const contentParts = page.content.split('<!-- IMAGES -->');
              
              if (contentParts.length > 1) {
                const imagesSection = contentParts[1].trim();
                const imageStringList = imagesSection.split('\n').filter(line => line.trim() !== '');
                
                pageImages = imageStringList.map(img => {
                  try {
                    return JSON.parse(img.trim());
                  } catch (e) {
                    return null;
                  }
                }).filter(img => img !== null);
              }
            }
          } catch (e) {
            console.error("Error parsing page images:", e);
          }
          
          return {
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
            pageImages: pageImages,
            published: page.published || false,
            is_parent: false
          };
        });
        
        for (let i = 0; i < formattedPages.length; i++) {
          const page = formattedPages[i];
          const hasChildren = formattedPages.some(p => p.parentPath === page.path);
          
          if (hasChildren) {
            formattedPages[i] = { ...page, is_parent: true };
            console.log(`Admin - Pagina ${page.path} ha figli, contrassegnata come parent`);
          }
        }
        
        console.log("Admin - Pages loaded from database:", formattedPages.length);
        setPages(formattedPages);
        
        safelyStorePagesInLocalStorage(formattedPages);
      } else {
        console.log("Admin - No pages data returned from database");
        setPages([]);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      setLoadError("Errore nel recupero delle pagine. Prova ad aggiornare la pagina.");
      toast.error("Errore nel recupero delle pagine");
      
      try {
        const cachedPagesString = localStorage.getItem('cached_pages');
        if (cachedPagesString) {
          const cachedPages = JSON.parse(cachedPagesString);
          console.log("Admin - Using cached pages as fallback after error:", cachedPages.length);
          setPages(cachedPages);
        }
      } catch (err) {
        console.error("Error parsing cached pages for fallback:", err);
      }
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && !isMaster) {
      fetchPages();
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
    console.log("Admin - Page created, new pages count:", newPages.length);
    setPages(newPages);
    safelyStorePagesInLocalStorage(newPages);
  };
  
  const handlePagesUpdate = (updatedPages: PageData[]) => {
    console.log("Admin - Pages updated, count:", updatedPages.length);
    setPages(updatedPages);
    safelyStorePagesInLocalStorage(updatedPages);
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
        {loadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{loadError}</p>
            <Button 
              onClick={() => {
                setIsLoading(true);
                fetchPages().finally(() => setIsLoading(false));
              }}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Riprova
            </Button>
          </div>
        )}
        
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
            handlePageCreated={handlePageCreated}
            handlePagesUpdate={handlePagesUpdate}
            keywordToIconMap={keywordToIconMap}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
