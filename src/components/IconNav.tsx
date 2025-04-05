
import React, { useEffect, useState } from "react";
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
}

interface IconData {
  id: string;
  title: string;
  icon: string;
  path: string;
  parent_path: string | null;
  published?: boolean;
}

const IconNav: React.FC<IconNavProps> = ({ parentPath }) => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching icons with parent_path:", parentPath);
        
        // Query to get icons from the database
        const { data, error } = await supabase
          .from('menu_icons')
          .select('*')
          .eq('parent_path', parentPath);
        
        if (error) throw error;
        
        console.log("Icons data from database:", data);
        
        if (data && data.length === 0) {
          console.log("No icons found for this parent path. Checking if we need to show all top-level icons.");
          // If we're at the top level and no icons are found, log an info message
          if (parentPath === null) {
            console.log("This is the main menu, but no top-level icons were found.");
          }
        }
        
        // Transform the data to match the IconData interface
        // Note: We're not filtering by published here to debug what icons exist
        const transformedData = data?.map(icon => ({
          id: icon.id,
          title: icon.label, // Use label as title
          icon: icon.icon,
          path: icon.path,
          parent_path: icon.parent_path,
          published: icon.published
        })) || [];
        
        console.log("Transformed icons data:", transformedData);
        
        // Now filter to only show published icons in the actual UI
        const publishedIcons = transformedData.filter(icon => icon.published === true);
        console.log("Published icons that will be displayed:", publishedIcons);
        
        setIcons(publishedIcons);
      } catch (error) {
        console.error("Errore nel caricamento delle icone:", error);
        setError("Impossibile caricare le icone del menu");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIcons();
  }, [parentPath]);
  
  const handleIconClick = (path: string) => {
    navigate(path);
  };

  // Function to render the icon component based on icon name
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-500">
            <TranslatedText text="Nessuna pagina disponibile in questa sezione" />
          </p>
          <p className="text-sm text-gray-400 mt-2">
            <TranslatedText text="Assicurati di aver pubblicato la pagina dall'area admin" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6 max-w-6xl mx-auto overflow-y-auto">
      {icons.map((icon) => (
        <div 
          key={icon.id}
          className="flex flex-col items-center bg-white rounded-xl shadow-md p-5 cursor-pointer transform transition-transform hover:scale-105 active:scale-95"
          onClick={() => handleIconClick(icon.path)}
        >
          <div className="bg-emerald-100 p-4 mb-3 rounded-full text-emerald-600">
            {renderIcon(icon.icon)}
          </div>
          <span className="text-center text-gray-700 font-medium">
            <TranslatedText text={icon.title} />
          </span>
        </div>
      ))}
    </div>
  );
};

export default IconNav;
