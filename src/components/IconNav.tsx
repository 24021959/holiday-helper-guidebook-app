
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Book, Home, FileText, Image, MessageCircle, Info, Map, 
  Utensils, Landmark, Hotel, Wifi, Bus, ShoppingBag, Calendar, 
  Phone, Coffee, Bike, Camera, Globe, Mountain, MapPin, Newspaper,
  Music, Heart, Trees, Users, ShoppingCart, Taxi, Building, Palmtree,
  UtensilsCrossed, Bed, Shirt, Key, PawPrint, PartyPopper, Trophy,
  Plane, Car, Train
} from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

interface IconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

interface IconData {
  id: string;
  title: string;
  icon: string;
  path: string;
  parent_path: string | null;
  is_parent?: boolean;
}

const IconNav: React.FC<IconNavProps> = ({ parentPath, onRefresh, refreshTrigger = 0 }) => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const keywordToIconMap = useKeywordToIconMap();

  // Enhanced pastel colors with better contrast for text
  const pastelColors = [
    { bg: "bg-[#F2FCE2]", text: "text-emerald-700" },  // verde chiaro
    { bg: "bg-[#FEF7CD]", text: "text-amber-700" },    // giallo chiaro
    { bg: "bg-[#FFE5D3]", text: "text-orange-700" },   // arancione chiaro
    { bg: "bg-[#E5DEFF]", text: "text-indigo-700" },   // viola chiaro
    { bg: "bg-[#FFDEE2]", text: "text-rose-700" },     // rosa chiaro
    { bg: "bg-[#D8F3FF]", text: "text-blue-700" },     // azzurro chiaro
    { bg: "bg-[#D3E4FD]", text: "text-blue-700" },     // blu chiaro
    { bg: "bg-[#F1F0FB]", text: "text-slate-700" },    // grigio chiaro
  ];

  // Function to identify the most appropriate icon based on page title
  const identifyIconFromTitle = (title: string) => {
    // Convert title to lowercase for case-insensitive matching
    const lowerTitle = title.toLowerCase();
    
    // Direct mapping for common titles
    if (lowerTitle.includes("taxi") || lowerTitle.includes("trasporto privato")) return "Taxi";
    if (lowerTitle.includes("storia")) return "Book";
    if (lowerTitle.includes("città") || lowerTitle.includes("centro")) return "Building";
    if (lowerTitle.includes("hotel") || lowerTitle.includes("servizi hotel")) return "Hotel";
    if (lowerTitle.includes("ristorante") || lowerTitle.includes("cucina")) return "Utensils";
    if (lowerTitle.includes("spiaggia") || lowerTitle.includes("mare")) return "Palmtree";
    if (lowerTitle.includes("colazione") || lowerTitle.includes("breakfast")) return "Coffee";
    if (lowerTitle.includes("camera") || lowerTitle.includes("alloggio")) return "Bed";
    if (lowerTitle.includes("contatti") || lowerTitle.includes("telefono")) return "Phone";
    if (lowerTitle.includes("wifi") || lowerTitle.includes("internet")) return "Wifi";
    if (lowerTitle.includes("eventi") || lowerTitle.includes("calendar")) return "Calendar";
    if (lowerTitle.includes("shopping") || lowerTitle.includes("negozi")) return "ShoppingBag";
    if (lowerTitle.includes("mappa") || lowerTitle.includes("dove")) return "Map";
    if (lowerTitle.includes("attività") || lowerTitle.includes("sport")) return "Bike";
    if (lowerTitle.includes("foto") || lowerTitle.includes("galleria")) return "Camera";
    if (lowerTitle.includes("benvenuto") || lowerTitle.includes("welcome")) return "Home";
    if (lowerTitle.includes("animali") || lowerTitle.includes("pet")) return "PawPrint";
    if (lowerTitle.includes("festa") || lowerTitle.includes("evento")) return "PartyPopper";
    if (lowerTitle.includes("aeroporto") || lowerTitle.includes("volo")) return "Plane";
    if (lowerTitle.includes("auto") || lowerTitle.includes("noleggio")) return "Car";
    if (lowerTitle.includes("treno") || lowerTitle.includes("stazione")) return "Train";
    
    // Check for keywords in the mapping
    for (const [keyword, iconName] of Object.entries(keywordToIconMap)) {
      if (lowerTitle.includes(keyword)) {
        return iconName;
      }
    }
    
    // Default icon if no match found
    return "FileText";
  };

  const fetchIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Caricamento icone con parent_path:", parentPath);
      
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*');
      
      if (error) {
        console.error("Errore caricamento icone:", error);
        throw error;
      }
      
      console.log("Tutti i dati icone dal database:", data);
      
      const filteredData = data?.filter(icon => icon.parent_path === parentPath);
      
      console.log("Dati filtrati per parent_path:", parentPath, filteredData);
      
      if (!filteredData || filteredData.length === 0) {
        console.log("Nessuna icona trovata per parent_path:", parentPath);
      }
      
      const transformedIcons = filteredData?.map(icon => {
        const isParent = data?.some(item => item.parent_path === icon.path);
        let iconName = icon.icon;
        
        // Auto-detect more suitable icon if the current one is generic
        if (iconName === "FileText" || !iconName) {
          iconName = identifyIconFromTitle(icon.label);
        }
        
        return {
          id: icon.id,
          title: icon.label,
          icon: iconName,
          path: icon.path,
          parent_path: icon.parent_path,
          is_parent: isParent
        };
      }) || [];
      
      console.log("Icone trasformate che verranno visualizzate:", transformedIcons);
      
      setIcons(transformedIcons);
    } catch (error) {
      console.error("Errore nel caricamento delle icone:", error);
      setError("Impossibile caricare le icone del menu");
    } finally {
      setIsLoading(false);
    }
  }, [parentPath, keywordToIconMap, identifyIconFromTitle]);
  
  useEffect(() => {
    console.log("IconNav - refreshTrigger aggiornato:", refreshTrigger);
    fetchIcons();
  }, [parentPath, refreshTrigger, fetchIcons]);

  const handleIconClick = (icon: IconData) => {
    if (icon.is_parent) {
      navigate(`/submenu${icon.path}`);
    } else {
      navigate(icon.path, { 
        state: { 
          parentPath: parentPath 
        } 
      });
    }
  };

  const renderIcon = (iconName: string) => {
    const iconSize = "w-14 h-14";
    
    switch (iconName) {
      case 'FileText': return <FileText className={iconSize} />;
      case 'Image': return <Image className={iconSize} />;
      case 'MessageCircle': return <MessageCircle className={iconSize} />;
      case 'Info': return <Info className={iconSize} />;
      case 'Map': return <Map className={iconSize} />;
      case 'Utensils': return <Utensils className={iconSize} />;
      case 'Landmark': return <Landmark className={iconSize} />;
      case 'Hotel': return <Hotel className={iconSize} />;
      case 'Wifi': return <Wifi className={iconSize} />;
      case 'Bus': return <Bus className={iconSize} />;
      case 'ShoppingBag': return <ShoppingBag className={iconSize} />;
      case 'Calendar': return <Calendar className={iconSize} />;
      case 'Phone': return <Phone className={iconSize} />;
      case 'Coffee': return <Coffee className={iconSize} />;
      case 'Book': return <Book className={iconSize} />;
      case 'Home': return <Home className={iconSize} />;
      case 'Bike': return <Bike className={iconSize} />;
      case 'Camera': return <Camera className={iconSize} />;
      case 'Globe': return <Globe className={iconSize} />;
      case 'Mountain': return <Mountain className={iconSize} />;
      case 'MapPin': return <MapPin className={iconSize} />;
      case 'Newspaper': return <Newspaper className={iconSize} />;
      case 'Music': return <Music className={iconSize} />;
      case 'Heart': return <Heart className={iconSize} />;
      case 'Trees': return <Trees className={iconSize} />;
      case 'Users': return <Users className={iconSize} />;
      case 'ShoppingCart': return <ShoppingCart className={iconSize} />;
      case 'Taxi': return <Taxi className={iconSize} />;
      case 'Building': return <Building className={iconSize} />;
      case 'Palmtree': return <Palmtree className={iconSize} />;
      case 'UtensilsCrossed': return <UtensilsCrossed className={iconSize} />;
      case 'Bed': return <Bed className={iconSize} />;
      case 'Shirt': return <Shirt className={iconSize} />;
      case 'Key': return <Key className={iconSize} />;
      case 'PawPrint': return <PawPrint className={iconSize} />;
      case 'PartyPopper': return <PartyPopper className={iconSize} />;
      case 'Trophy': return <Trophy className={iconSize} />;
      case 'Plane': return <Plane className={iconSize} />;
      case 'Car': return <Car className={iconSize} />;
      case 'Train': return <Train className={iconSize} />;
      default: return <FileText className={iconSize} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500">
            <TranslatedText text={error} />
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <TranslatedText text="Riprova" />
          </button>
        </div>
      </div>
    );
  }

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <p className="text-gray-600 text-lg font-medium mb-3">
            <TranslatedText text="Menu vuoto" />
          </p>
          <p className="text-gray-500 mb-3">
            <TranslatedText text="Non ci sono pagine disponibili in questa sezione del menu" />
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-700 mb-2 font-medium">
              <TranslatedText text="Come aggiungere pagine:" />
            </p>
            <ul className="text-sm text-amber-600 list-disc pl-5 space-y-2">
              <li>
                <TranslatedText text="Vai all'area amministrativa (/admin)" />
              </li>
              <li>
                <TranslatedText text="Usa la funzione 'Crea Nuova Pagina'" />
              </li>
              <li>
                <TranslatedText text="Le pagine create appariranno automaticamente nel menu" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 h-full">
        {icons.map((icon, index) => {
          const colorIndex = index % pastelColors.length;
          const colorScheme = pastelColors[colorIndex];
          
          // Use a subtle border for parent menu items instead of text
          const isParentStyle = icon.is_parent ? "border-2 border-emerald-300" : "";
          
          return (
            <div 
              key={icon.id}
              className={`flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 cursor-pointer transform transition-transform hover:scale-102 active:scale-98 h-full ${isParentStyle}`}
              onClick={() => handleIconClick(icon)}
            >
              <div className={`${colorScheme.bg} p-5 mb-4 rounded-full ${colorScheme.text} flex items-center justify-center`}>
                {renderIcon(icon.icon)}
              </div>
              <span className="text-center text-gray-700 font-medium text-lg">
                <TranslatedText text={icon.title} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IconNav;
