
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  MapPin, 
  Book, 
  Coffee, 
  Utensils, 
  Phone, 
  MessageCircle, 
  User,
  Wifi, 
  Bus, 
  ShoppingCart,
  Calendar,
  Settings,
  Image,
  Hotel,
  Bike,
  Map,
  Info,
  FileText,
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
  ShoppingBag,
  Loader2,
  ArrowLeft
} from "lucide-react";

interface NavIcon {
  id?: string;
  icon: string;
  label: string;
  bgColor: string;
  path: string;
  isSubmenu?: boolean;
  parentPath?: string | null;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Home': return <Home className="w-12 h-12" strokeWidth={1.5} />;
    case 'MapPin': return <MapPin className="w-12 h-12" strokeWidth={1.5} />;
    case 'Book': return <Book className="w-12 h-12" strokeWidth={1.5} />;
    case 'Coffee': return <Coffee className="w-12 h-12" strokeWidth={1.5} />;
    case 'Utensils': return <Utensils className="w-12 h-12" strokeWidth={1.5} />;
    case 'Phone': return <Phone className="w-12 h-12" strokeWidth={1.5} />;
    case 'MessageCircle': return <MessageCircle className="w-12 h-12" strokeWidth={1.5} />;
    case 'Wifi': return <Wifi className="w-12 h-12" strokeWidth={1.5} />;
    case 'Bus': return <Bus className="w-12 h-12" strokeWidth={1.5} />;
    case 'ShoppingCart': return <ShoppingCart className="w-12 h-12" strokeWidth={1.5} />;
    case 'ShoppingBag': return <ShoppingBag className="w-12 h-12" strokeWidth={1.5} />;
    case 'Calendar': return <Calendar className="w-12 h-12" strokeWidth={1.5} />;
    case 'Hotel': return <Hotel className="w-12 h-12" strokeWidth={1.5} />;
    case 'Bike': return <Bike className="w-12 h-12" strokeWidth={1.5} />;
    case 'Map': return <Map className="w-12 h-12" strokeWidth={1.5} />;
    case 'Info': return <Info className="w-12 h-12" strokeWidth={1.5} />;
    case 'Image': return <Image className="w-12 h-12" strokeWidth={1.5} />;
    case 'FileText': return <FileText className="w-12 h-12" strokeWidth={1.5} />;
    case 'Landmark': return <Landmark className="w-12 h-12" strokeWidth={1.5} />;
    case 'Building': return <Building className="w-12 h-12" strokeWidth={1.5} />;
    case 'Trees': return <Trees className="w-12 h-12" strokeWidth={1.5} />;
    case 'Mountain': return <Mountain className="w-12 h-12" strokeWidth={1.5} />;
    case 'Users': return <Users className="w-12 h-12" strokeWidth={1.5} />;
    case 'Music': return <Music className="w-12 h-12" strokeWidth={1.5} />;
    case 'Camera': return <Camera className="w-12 h-12" strokeWidth={1.5} />;
    case 'Globe': return <Globe className="w-12 h-12" strokeWidth={1.5} />;
    case 'Newspaper': return <Newspaper className="w-12 h-12" strokeWidth={1.5} />;
    case 'PawPrint': return <PawPrint className="w-12 h-12" strokeWidth={1.5} />;
    case 'Heart': return <Heart className="w-12 h-12" strokeWidth={1.5} />;
    default: return <FileText className="w-12 h-12" strokeWidth={1.5} />;
  }
};

// Icone predefinite del menu
const defaultIcons: NavIcon[] = [
  { icon: 'Home', label: "Benvenuto", bgColor: "bg-blue-200", path: "/welcome", isSubmenu: false, parentPath: null },
  { icon: 'Book', label: "Storia", bgColor: "bg-teal-200", path: "/storia", isSubmenu: false, parentPath: null },
  { icon: 'Hotel', label: "Servizi hotel", bgColor: "bg-amber-200", path: "/servizi-hotel", isSubmenu: false, parentPath: null },
  { icon: 'Coffee', label: "Servizi esterni", bgColor: "bg-green-200", path: "/servizi-esterni", isSubmenu: false, parentPath: null },
  { icon: 'Utensils', label: "Ristorante", bgColor: "bg-purple-200", path: "/ristorante", isSubmenu: false, parentPath: null },
  { icon: 'Map', label: "Scopri il territorio", bgColor: "bg-orange-200", path: "/scopri-territorio", isSubmenu: false, parentPath: null },
  { icon: 'MapPin', label: "Posizione", bgColor: "bg-pink-200", path: "/location", isSubmenu: false, parentPath: null },
  { icon: 'Wifi', label: "Wifi", bgColor: "bg-indigo-200", path: "/wifi", isSubmenu: false, parentPath: null },
  { icon: 'Bike', label: "Attività", bgColor: "bg-red-200", path: "/activities", isSubmenu: false, parentPath: null },
  { icon: 'Bus', label: "Trasporti", bgColor: "bg-emerald-200", path: "/transport", isSubmenu: false, parentPath: null },
  { icon: 'ShoppingBag', label: "Shopping", bgColor: "bg-sky-200", path: "/shopping", isSubmenu: false, parentPath: null },
  { icon: 'Phone', label: "Contatti", bgColor: "bg-yellow-200", path: "/contacts", isSubmenu: false, parentPath: null },
  { icon: 'Calendar', label: "Eventi", bgColor: "bg-lime-200", path: "/events", isSubmenu: false, parentPath: null },
  { icon: 'Image', label: "Galleria", bgColor: "bg-fuchsia-200", path: "/gallery", isSubmenu: false, parentPath: null },
  { icon: 'Info', label: "Info", bgColor: "bg-cyan-200", path: "/info", isSubmenu: false, parentPath: null }
];

interface IconNavProps {
  parentPath: string | null;
}

const IconNav: React.FC<IconNavProps> = ({ parentPath }) => {
  const [icons, setIcons] = useState<NavIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carica le icone personalizzate da Supabase
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        setLoading(true);
        
        // Ottieni le icone del menu da Supabase
        const { data: menuIcons, error: menuError } = await supabase
          .from('menu_icons')
          .select('*')
          .eq('parent_path', parentPath);
        
        if (menuError) throw menuError;
        
        if (menuIcons && menuIcons.length > 0) {
          // Converti i dati di Supabase nel formato NavIcon
          const customIcons: NavIcon[] = menuIcons.map(item => ({
            id: item.id,
            icon: item.icon,
            label: item.label,
            bgColor: item.bg_color,
            path: item.path,
            isSubmenu: item.is_submenu || false,
            parentPath: item.parent_path
          }));
          
          setIcons(customIcons);
        } else {
          // Se non ci sono icone personalizzate per il percorso specificato, usa le icone predefinite
          // ma solo se siamo nel menu principale (parentPath === null)
          if (parentPath === null) {
            setIcons(defaultIcons);
          } else {
            setIcons([]);
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento delle icone:", error);
        setError("Impossibile caricare le icone del menu");
        
        // Fallback al localStorage se Supabase fallisce
        if (parentPath === null) {
          const savedIcons = localStorage.getItem("menuIcons");
          if (savedIcons) {
            try {
              const customIcons: NavIcon[] = JSON.parse(savedIcons);
              const filteredIcons = customIcons.filter(icon => !icon.parentPath); // Solo icone del menu principale
              
              // Unisci le icone predefinite con quelle personalizzate
              const mergedIcons = [...defaultIcons];
              
              filteredIcons.forEach(customIcon => {
                const existingIndex = mergedIcons.findIndex(icon => icon.path === customIcon.path);
                if (existingIndex >= 0) {
                  mergedIcons[existingIndex] = customIcon;
                } else {
                  mergedIcons.push(customIcon);
                }
              });
              
              setIcons(mergedIcons);
            } catch (err) {
              console.error("Errore nel parsing delle icone dal localStorage:", err);
              setIcons(defaultIcons);
            }
          } else {
            setIcons(defaultIcons);
          }
        } else {
          setIcons([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchIcons();
  }, [parentPath]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">Caricamento menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-teal-50 to-emerald-100">
      {/* Mostra il pulsante "Torna al menu" solo se siamo in un sottomenu */}
      {parentPath && (
        <div className="p-4">
          <Link 
            to="/menu" 
            className="flex items-center px-4 py-2 bg-white text-emerald-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Torna al menu principale</span>
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 w-full h-full p-4">
        {icons.map((item, index) => (
          <Link 
            to={item.path}
            key={index}
            className={`flex flex-col items-center justify-center aspect-square cursor-pointer ${item.bgColor} rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-white/80 shadow-sm`}
          >
            <div className="bg-white rounded-full mb-2 p-4 shadow-md flex items-center justify-center">
              {getIconComponent(item.icon)}
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
