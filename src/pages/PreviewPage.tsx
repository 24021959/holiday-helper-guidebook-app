import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackToMenu from "@/components/BackToMenu";

interface PageData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  listItems?: any[];
  listType?: 'restaurants' | 'activities' | 'locations';
}

interface PreviewPageProps {
  pageRoute?: string;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ pageRoute }) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerSettings, setHeaderSettings] = useState<{ logoUrl?: string; headerColor?: string }>({});

  const path = pageRoute || location.pathname;
  const effectivePath = path.startsWith('/preview/') ? path.substring(9) : path;

  useEffect(() => {
    console.log("Caricamento pagina con percorso:", effectivePath);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: pageData, error: pageError } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('path', effectivePath)
          .single();
        
        if (pageError) {
          console.error("Errore nel caricamento della pagina:", pageError);
          throw new Error(`Pagina non trovata: ${effectivePath}`);
        }
        
        if (pageData) {
          const listItemsArray = pageData.list_items 
            ? Array.isArray(pageData.list_items) 
                ? pageData.list_items 
                : []
            : [];
            
          setPageData({
            id: pageData.id,
            title: pageData.title,
            content: pageData.content,
            imageUrl: pageData.image_url,
            listItems: listItemsArray,
            listType: pageData.list_type as 'restaurants' | 'activities' | 'locations' | undefined
          });
        } else {
          throw new Error(`Pagina non trovata: ${effectivePath}`);
        }
        
        const { data: headerData, error: headerError } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (!headerError && headerData) {
          setHeaderSettings({
            logoUrl: headerData.logo_url,
            headerColor: headerData.header_color,
          });
        }
      } catch (error) {
        console.error("Errore:", error);
        setError(error instanceof Error ? error.message : "Errore sconosciuto");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [effectivePath]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">Caricamento pagina...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          logoUrl={headerSettings.logoUrl} 
          backgroundColor={headerSettings.headerColor}
          showAdminButton={true}
        />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-600 mb-6">La pagina richiesta non è stata trovata. Controlla l'URL o torna al menu principale.</p>
            <Button onClick={() => navigate('/menu')} className="bg-emerald-600 hover:bg-emerald-700">
              Torna al Menu
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          logoUrl={headerSettings.logoUrl} 
          backgroundColor={headerSettings.headerColor}
          showAdminButton={true}
        />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Nessun contenuto trovato per questa pagina.</p>
            <Button onClick={() => navigate('/menu')} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
              Torna al Menu
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl} 
        backgroundColor={headerSettings.headerColor}
        showAdminButton={true}
      />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="container mx-auto">
          <BackToMenu />
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-4 mb-6">
            {pageData.title}
          </h1>
          
          {pageData.imageUrl && (
            <div className="mb-6">
              <img 
                src={pageData.imageUrl} 
                alt={pageData.title} 
                className="w-full h-auto max-h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          
          <div className="bg-white p-5 rounded-lg shadow-md mb-6">
            <div className="prose max-w-none">
              {pageData.content.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index} className="mb-4">{paragraph}</p> : <br key={index} />
              ))}
            </div>
          </div>
          
          {pageData.listItems && pageData.listItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">
                {pageData.listType === "restaurants" ? "Ristoranti Consigliati" :
                 pageData.listType === "activities" ? "Attività Consigliate" :
                 "Luoghi di Interesse"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageData.listItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                      {item.description && <p className="text-gray-600 mb-3">{item.description}</p>}
                      
                      <div className="space-y-2">
                        {item.phoneNumber && (
                          <div className="flex items-center text-sm">
                            <span className="text-emerald-600 mr-2">📞</span>
                            <a href={`tel:${item.phoneNumber}`} className="text-emerald-600 hover:underline">
                              {item.phoneNumber}
                            </a>
                          </div>
                        )}
                        
                        {item.mapsUrl && (
                          <div className="flex items-center text-sm">
                            <span className="text-emerald-600 mr-2">📍</span>
                            <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                              Visualizza sulla mappa
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewPage;
