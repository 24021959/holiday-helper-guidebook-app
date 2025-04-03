
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/pages/Admin";
import { useNavigate } from "react-router-dom";
import {
  FileText, MessageCircle, Home, 
  MapPin, Book, Coffee, Utensils, Phone, 
  Wifi, Bus, ShoppingCart, Calendar, 
  Hotel, Bike, Map, Info, Image,
  Landmark, Building, Trees, Mountain, 
  Users, Music, Camera, Globe,
  Newspaper, PawPrint, Heart, Bookmark, ShoppingBag
} from "lucide-react";

interface ManagePagesViewProps {
  pages: PageData[];
  onPagesUpdate: (pages: PageData[]) => void;
}

export const ManagePagesView: React.FC<ManagePagesViewProps> = ({ 
  pages, 
  onPagesUpdate 
}) => {
  const navigate = useNavigate();

  const handleDeletePage = async (id: string) => {
    try {
      const pageToDelete = pages.find(page => page.id === id);
      if (!pageToDelete) return;
      
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      
      if (pageError) throw pageError;
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .delete()
        .eq('path', pageToDelete.path);
      
      if (iconError) throw iconError;
      
      if (!pageToDelete.isSubmenu) {
        const subPages = pages.filter(page => page.parentPath === pageToDelete.path);
        
        for (const subPage of subPages) {
          await supabase.from('custom_pages').delete().eq('id', subPage.id);
          await supabase.from('menu_icons').delete().eq('path', subPage.path);
        }
      }
      
      const updatedPages = pages.filter(page => page.id !== id);
      onPagesUpdate(updatedPages);
      
      toast.info("Pagina eliminata");
    } catch (error) {
      console.error("Errore nell'eliminare la pagina:", error);
      toast.error("Errore nell'eliminare la pagina");
    }
  };

  const handlePreviewPage = (path: string) => {
    navigate(`/preview/${path}`);
  };

  const renderIconPreview = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'Image': return <Image className="w-6 h-6" />;
      case 'MessageCircle': return <MessageCircle className="w-6 h-6" />;
      case 'Info': return <Info className="w-6 h-6" />;
      case 'Map': return <Map className="w-6 h-6" />;
      case 'Utensils': return <Utensils className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'Hotel': return <Hotel className="w-6 h-6" />;
      case 'Wifi': return <Wifi className="w-6 h-6" />;
      case 'Bus': return <Bus className="w-6 h-6" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
      case 'Calendar': return <Calendar className="w-6 h-6" />;
      case 'Phone': return <Phone className="w-6 h-6" />;
      case 'Book': return <Book className="w-6 h-6" />;
      case 'Coffee': return <Coffee className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Bike': return <Bike className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Building': return <Building className="w-6 h-6" />;
      case 'Globe': return <Globe className="w-6 h-6" />;
      case 'Music': return <Music className="w-6 h-6" />;
      case 'Camera': return <Camera className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Gestisci Pagine</h2>
      
      {pages.length === 0 ? (
        <p className="text-gray-500">Nessuna pagina creata finora</p>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-200 p-2 rounded-md">
                  {renderIconPreview(page.icon || "FileText")}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{page.title}</h3>
                  <p className="text-gray-500 text-sm">/{page.path}</p>
                  {page.isSubmenu && (
                    <p className="text-xs text-teal-600 mt-1">
                      Sottopagina di: {page.parentPath}
                    </p>
                  )}
                  {page.listItems && page.listItems.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      {page.listItems.length} {
                        page.listType === "restaurants" ? "ristoranti" :
                        page.listType === "activities" ? "attività" : "luoghi"
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePreviewPage(page.path)}>
                  Anteprima
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeletePage(page.id)}>
                  Elimina
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
