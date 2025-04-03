
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText,
  MessageCircle,
  Home,
  MapPin,
  Book,
  Coffee,
  Utensils,
  Phone,
  Wifi,
  Bus,
  ShoppingCart,
  Calendar,
  Hotel,
  Bike,
  Map,
  Info,
  Image,
  Landmark,
  Building,
  Trees,
  Mountain,
  Users,
  Music,
  Camera,
  Globe,
  Newspaper,
  PawPrint,
  Heart,
  Bookmark,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  bgColor: string;
  path: string;
  isSubmenu?: boolean;
  parentPath?: string | null;
}

interface IconNavProps {
  parentPath: string | null;
}

const IconNav: React.FC<IconNavProps> = ({ parentPath }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('menu_icons').select('*');
        
        if (parentPath) {
          // Se c'è parentPath, recupera le icone con quel parent
          query = query.eq('parent_path', parentPath);
        } else {
          // Altrimenti recupera le icone principali (senza parent)
          query = query.is('parent_path', null);
        }
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        if (data) {
          const items: MenuItem[] = data.map(item => ({
            id: item.id,
            icon: item.icon,
            label: item.label,
            bgColor: item.bg_color,
            path: item.path,
            isSubmenu: item.is_submenu,
            parentPath: item.parent_path
          }));
          setMenuItems(items);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle icone del menu:", error);
        setError("Impossibile caricare le icone del menu");
        
        // Fallback al localStorage se Supabase fallisce
        const savedIcons = localStorage.getItem("menuIcons");
        if (savedIcons) {
          try {
            let items = JSON.parse(savedIcons);
            if (parentPath) {
              // Filtra per parentPath
              items = items.filter((item: any) => item.parentPath === parentPath);
            } else {
              // Solo icone principali
              items = items.filter((item: any) => !item.parentPath);
            }
            setMenuItems(items);
          } catch (err) {
            console.error("Errore nel parsing delle icone dal localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [parentPath]);

  const handleIconClick = (path: string, isSubmenu?: boolean) => {
    if (isSubmenu) {
      // Se è un sottomenu, vai alla pagina del sottomenu
      navigate(`/submenu/${path.replace('/', '')}`);
    } else {
      // Altrimenti, vai alla pagina normale
      navigate(path);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText":
        return <FileText className="w-8 h-8" />;
      case "MessageCircle":
        return <MessageCircle className="w-8 h-8" />;
      case "Home":
        return <Home className="w-8 h-8" />;
      case "MapPin":
        return <MapPin className="w-8 h-8" />;
      case "Book":
        return <Book className="w-8 h-8" />;
      case "Coffee":
        return <Coffee className="w-8 h-8" />;
      case "Utensils":
        return <Utensils className="w-8 h-8" />;
      case "Phone":
        return <Phone className="w-8 h-8" />;
      case "Wifi":
        return <Wifi className="w-8 h-8" />;
      case "Bus":
        return <Bus className="w-8 h-8" />;
      case "ShoppingCart":
        return <ShoppingCart className="w-8 h-8" />;
      case "Calendar":
        return <Calendar className="w-8 h-8" />;
      case "Hotel":
        return <Hotel className="w-8 h-8" />;
      case "Bike":
        return <Bike className="w-8 h-8" />;
      case "Map":
        return <Map className="w-8 h-8" />;
      case "Info":
        return <Info className="w-8 h-8" />;
      case "Image":
        return <Image className="w-8 h-8" />;
      case "Landmark":
        return <Landmark className="w-8 h-8" />;
      case "Building":
        return <Building className="w-8 h-8" />;
      case "Trees":
        return <Trees className="w-8 h-8" />;
      case "Mountain":
        return <Mountain className="w-8 h-8" />;
      case "Users":
        return <Users className="w-8 h-8" />;
      case "Music":
        return <Music className="w-8 h-8" />;
      case "Camera":
        return <Camera className="w-8 h-8" />;
      case "Globe":
        return <Globe className="w-8 h-8" />;
      case "Newspaper":
        return <Newspaper className="w-8 h-8" />;
      case "PawPrint":
        return <PawPrint className="w-8 h-8" />;
      case "Heart":
        return <Heart className="w-8 h-8" />;
      case "Bookmark":
        return <Bookmark className="w-8 h-8" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="mt-2 text-emerald-700 text-sm">Caricamento icone...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-gray-500 text-center">
          {parentPath 
            ? "Nessun elemento presente in questo sottomenu. Aggiungi contenuti dal pannello di amministrazione."
            : "Nessuna icona presente nel menu. Aggiungi icone dal pannello di amministrazione."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 p-4 md:p-6 overflow-y-auto">
      {menuItems.map((item) => (
        <div
          key={item.id}
          onClick={() => handleIconClick(item.path, item.isSubmenu)}
          className={`${
            item.bgColor || "bg-blue-200"
          } rounded-lg shadow-md p-4 flex flex-col items-center justify-center h-24 md:h-28 cursor-pointer hover:opacity-90 transition-opacity`}
        >
          {renderIcon(item.icon)}
          <p className="mt-2 text-center text-sm font-medium">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default IconNav;
