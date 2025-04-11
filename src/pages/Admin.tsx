import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings, Users, FileText, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import ManagePagesView from "@/components/admin/ManagePagesView";
import ErrorView from "@/components/ErrorView";
import MenuTranslationManager from "@/components/admin/MenuTranslationManager";

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

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { headerSettings, loading: headerLoading } = useHeaderSettings();
  const [activeTab, setActiveTab] = useState<string>("pages");
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywordToIconMap, setKeywordToIconMap] = useState<Record<string, string>>({});
  const [parentPages, setParentPages] = useState<PageData[]>([]);

  useEffect(() => {
    fetchPages();
    fetchKeywordToIconMap();
  }, []);

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
        
        // Filtra le pagine "parent"
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
    
    // Aggiorna anche le parent pages
    const parents = updatedPages.filter(page => page.content === "" && page.imageUrl === null);
    setParentPages(parents);
  };

  const leftColTabs = [
    {
      value: "pages",
      label: "Pagine",
      icon: <FileText className="h-5 w-5" />,
      component: (
        <ManagePagesView
          pages={pages}
          onPagesUpdate={handlePagesUpdate}
          parentPages={parentPages}
          keywordToIconMap={keywordToIconMap}
        />
      )
    },
    {
      value: "translation",
      label: "Traduzioni",
      icon: <Globe className="h-5 w-5" />,
      component: <MenuTranslationManager />
    },
  ];

  if (headerLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <svg className="animate-spin h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-emerald-700">Caricamento in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorView
        message={error}
        onRefresh={fetchPages}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        logoPosition={headerSettings.logoPosition as "left" | "center" | "right" || "left"}
        logoSize={headerSettings.logoSize as "small" | "medium" | "large" || "medium"}
        showAdminButton={false}
      />

      <main className="container mx-auto flex flex-col md:flex-row flex-grow p-4">
        {/* Left Column / Tabs */}
        <aside className="md:w-1/4 pr-4">
          <Card className="shadow-md border-0">
            <CardHeader className="py-2">
              <CardTitle className="text-lg font-semibold">Gestione</CardTitle>
              <CardDescription>
                Seleziona la sezione da gestire
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <Tabs defaultValue={activeTab} className="flex flex-col h-full">
                <TabsList className="flex flex-col space-y-1 border-r-2 border-gray-200 pr-4">
                  {leftColTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted hover:text-muted-foreground ${activeTab === tab.value ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </aside>

        {/* Right Column / Content */}
        <div className="md:w-3/4 pl-4">
          {leftColTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2">
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
