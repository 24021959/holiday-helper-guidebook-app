
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackToMenu from "@/components/BackToMenu";
import { MapPin, Phone } from "lucide-react";

interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  mapsUrl?: string;
  phoneNumber?: string;
}

const PreviewPage: React.FC = () => {
  const { pageSlug } = useParams<{pageSlug: string}>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Trova la pagina dal localStorage
    const savedPages = localStorage.getItem("customPages");
    if (savedPages) {
      const parsedPages: PageData[] = JSON.parse(savedPages);
      const foundPage = parsedPages.find(p => p.path === pageSlug);
      if (foundPage) {
        setPage(foundPage);
      }
    }
    
    setLoading(false);
  }, [pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
        <BackToMenu />
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-700 mb-4">Pagina non trovata</h1>
          <p className="text-gray-600 mb-4">La pagina richiesta non esiste.</p>
          <button 
            onClick={() => navigate("/menu")}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Torna al Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">{page.title}</h1>
        
        {page.imageUrl && (
          <div className="mb-6">
            <img 
              src={page.imageUrl} 
              alt={page.title} 
              className="w-full h-auto rounded-lg object-cover max-h-80"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/800x400?text=Immagine+non+disponibile";
              }}
            />
          </div>
        )}
        
        <div className="text-gray-600 prose">
          {page.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {/* Contact and location information */}
        {(page.mapsUrl || page.phoneNumber) && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-medium text-emerald-700 mb-4">Informazioni di contatto</h2>
            
            <div className="space-y-3">
              {page.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  <a 
                    href={`tel:${page.phoneNumber.replace(/\s/g, '')}`} 
                    className="text-emerald-600 hover:underline"
                  >
                    {page.phoneNumber}
                  </a>
                </div>
              )}
              
              {page.mapsUrl && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <a 
                    href={page.mapsUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-600 hover:underline"
                  >
                    Visualizza su Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
