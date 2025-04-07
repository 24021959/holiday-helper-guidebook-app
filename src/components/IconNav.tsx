
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Book, Home, FileText, Image, MessageCircle, Info, Map, 
  Utensils, Landmark, Hotel, Wifi, Bus, ShoppingBag, Calendar, 
  Phone, Coffee, Bike, Camera, Globe, Mountain, MapPin, Newspaper,
  Music, Heart, Trees, Users, ShoppingCart
} from "lucide-react";
import TranslatedText from "@/components/TranslatedText";

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
}

const IconNav: React.FC<IconNavProps> = ({ parentPath, onRefresh, refreshTrigger = 0 }) => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Array di colori pastello per le icone
  const pastelColors = [
    { bg: "bg-[#F2FCE2]", text: "text-emerald-700" }, // verde chiaro
    { bg: "bg-[#FEF7CD]", text: "text-amber-700" },   // giallo chiaro
    { bg: "bg-[#FEC6A1]", text: "text-orange-700" },  // arancione chiaro
    { bg: "bg-[#E5DEFF]", text: "text-indigo-700" },  // viola chiaro
    { bg: "bg-[#FFDEE2]", text: "text-rose-700" },    // rosa chiaro
    { bg: "bg-[#FDE1D3]", text: "text-orange-600" },  // pesca chiaro
    { bg: "bg-[#D3E4FD]", text: "text-blue-700" },    // blu chiaro
    { bg: "bg-[#F1F0FB]", text: "text-slate-700" },   // grigio chiaro
  ];

  const fetchIcons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Caricamento icone con parent_path:", parentPath);
      
      // Query semplificata senza filtri per mostrare tutte le icone
      const { data, error } = await supabase
        .from('menu_icons')
        .select('*');
      
      if (error) {
        console.error("Errore caricamento icone:", error);
        throw error;
      }
      
      console.log("Tutti i dati icone dal database:", data);
      
      // Filtriamo lato client per parent_path
      const filteredData = data?.filter(icon => icon.parent_path === parentPath);
      
      console.log("Dati filtrati per parent_path:", parentPath, filteredData);
      
      if (!filteredData || filteredData.length === 0) {
        console.log("Nessuna icona trovata per parent_path:", parentPath);
      }
      
      // Trasformiamo i dati per adattarli all'interfaccia IconData
      const transformedIcons = filteredData?.map(icon => ({
        id: icon.id,
        title: icon.label, // Usa label come titolo
        icon: icon.icon,
        path: icon.path,
        parent_path: icon.parent_path
      })) || [];
      
      console.log("Icone trasformate che verranno visualizzate:", transformedIcons);
      
      setIcons(transformedIcons);
    } catch (error) {
      console.error("Errore nel caricamento delle icone:", error);
      setError("Impossibile caricare le icone del menu");
    } finally {
      setIsLoading(false);
    }
  }, [parentPath]);
  
  useEffect(() => {
    console.log("IconNav - refreshTrigger aggiornato:", refreshTrigger);
    fetchIcons();
  }, [parentPath, refreshTrigger, fetchIcons]);

  // Funzione per renderizzare il componente icona basato sul nome
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-12 h-12" />;
      case 'Image': return <Image className="w-12 h-12" />;
      case 'MessageCircle': return <MessageCircle className="w-12 h-12" />;
      case 'Info': return <Info className="w-12 h-12" />;
      case 'Map': return <Map className="w-12 h-12" />;
      case 'Utensils': return <Utensils className="w-12 h-12" />;
      case 'Landmark': return <Landmark className="w-12 h-12" />;
      case 'Hotel': return <Hotel className="w-12 h-12" />;
      case 'Wifi': return <Wifi className="w-12 h-12" />;
      case 'Bus': return <Bus className="w-12 h-12" />;
      case 'ShoppingBag': return <ShoppingBag className="w-12 h-12" />;
      case 'Calendar': return <Calendar className="w-12 h-12" />;
      case 'Phone': return <Phone className="w-12 h-12" />;
      case 'Coffee': return <Coffee className="w-12 h-12" />;
      case 'Book': return <Book className="w-12 h-12" />;
      case 'Home': return <Home className="w-12 h-12" />;
      case 'Bike': return <Bike className="w-12 h-12" />;
      case 'Camera': return <Camera className="w-12 h-12" />;
      case 'Globe': return <Globe className="w-12 h-12" />;
      case 'Mountain': return <Mountain className="w-12 h-12" />;
      case 'MapPin': return <MapPin className="w-12 h-12" />;
      case 'Newspaper': return <Newspaper className="w-12 h-12" />;
      case 'Music': return <Music className="w-12 h-12" />;
      case 'Heart': return <Heart className="w-12 h-12" />;
      case 'Trees': return <Trees className="w-12 h-12" />;
      case 'Users': return <Users className="w-12 h-12" />;
      case 'ShoppingCart': return <ShoppingCart className="w-12 h-12" />;
      default: return <FileText className="w-12 h-12" />;
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
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6 max-w-6xl mx-auto overflow-y-auto flex-1">
        {icons.map((icon, index) => {
          // Seleziona un colore pastello dall'array in base all'indice
          const colorIndex = index % pastelColors.length;
          const colorScheme = pastelColors[colorIndex];
          
          return (
            <div 
              key={icon.id}
              className="flex flex-col items-center bg-white rounded-xl shadow-md p-5 cursor-pointer transform transition-transform hover:scale-105 active:scale-95"
              onClick={() => navigate(icon.path)}
            >
              <div className={`${colorScheme.bg} p-4 mb-3 rounded-full ${colorScheme.text}`}>
                {renderIcon(icon.icon)}
              </div>
              <span className="text-center text-gray-700 font-medium">
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
