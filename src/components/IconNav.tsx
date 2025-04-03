import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  ShoppingBag
} from "lucide-react";

interface NavIcon {
  icon: string;
  label: string;
  bgColor: string;
  path: string;
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
  { icon: 'Home', label: "Benvenuto", bgColor: "bg-blue-200", path: "/welcome" },
  { icon: 'Book', label: "Storia", bgColor: "bg-teal-200", path: "/storia" },
  { icon: 'Hotel', label: "Servizi hotel", bgColor: "bg-amber-200", path: "/servizi-hotel" },
  { icon: 'Coffee', label: "Servizi esterni", bgColor: "bg-green-200", path: "/servizi-esterni" },
  { icon: 'Utensils', label: "Ristorante", bgColor: "bg-purple-200", path: "/ristorante" },
  { icon: 'Map', label: "Scopri il territorio", bgColor: "bg-orange-200", path: "/scopri-territorio" },
  { icon: 'MapPin', label: "Posizione", bgColor: "bg-pink-200", path: "/location" },
  { icon: 'Wifi', label: "Wifi", bgColor: "bg-indigo-200", path: "/wifi" },
  { icon: 'Bike', label: "Attività", bgColor: "bg-red-200", path: "/activities" },
  { icon: 'Bus', label: "Trasporti", bgColor: "bg-emerald-200", path: "/transport" },
  { icon: 'ShoppingBag', label: "Shopping", bgColor: "bg-sky-200", path: "/shopping" },
  { icon: 'Phone', label: "Contatti", bgColor: "bg-yellow-200", path: "/contacts" },
  { icon: 'Calendar', label: "Eventi", bgColor: "bg-lime-200", path: "/events" },
  { icon: 'Image', label: "Galleria", bgColor: "bg-fuchsia-200", path: "/gallery" },
  { icon: 'Info', label: "Info", bgColor: "bg-cyan-200", path: "/info" }
];

const IconNav = () => {
  const [icons, setIcons] = useState<NavIcon[]>(defaultIcons);
  
  // Carica le icone personalizzate dal localStorage
  useEffect(() => {
    const savedIcons = localStorage.getItem("menuIcons");
    if (savedIcons) {
      try {
        const customIcons: NavIcon[] = JSON.parse(savedIcons);
        // Unisce le icone predefinite con quelle personalizzate
        // Le icone personalizzate con percorsi uguali sostituiranno quelle predefinite
        const mergedIcons = [...defaultIcons];
        
        customIcons.forEach(customIcon => {
          // Verifica se esiste già un'icona con lo stesso path
          const existingIndex = mergedIcons.findIndex(
            icon => icon.path === customIcon.path
          );
          
          if (existingIndex >= 0) {
            // Sostituisci l'icona esistente
            mergedIcons[existingIndex] = customIcon;
          } else {
            // Aggiungi la nuova icona
            mergedIcons.push(customIcon);
          }
        });
        
        setIcons(mergedIcons);
      } catch (error) {
        console.error("Errore nel caricamento delle icone personalizzate:", error);
      }
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-teal-50 to-emerald-100">
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
