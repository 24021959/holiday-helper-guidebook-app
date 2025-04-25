
import React from "react";
import { 
  Book, Home, FileText, Image, MessageCircle, Info, Map, 
  Utensils, Landmark, Hotel, Wifi, Bus, ShoppingBag, Calendar, 
  Phone, Coffee, Bike, Camera, Globe, Mountain, MapPin, Newspaper,
  Music, Heart, Trees, Users, ShoppingCart, Car, Building, Palmtree,
  UtensilsCrossed, Bed, Shirt, Key, PawPrint, PartyPopper, Trophy,
  Plane, Train, Loader2
} from "lucide-react";

interface IconRendererProps {
  iconName: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ 
  iconName, 
  size = "medium",
  className = "" 
}) => {
  // Determina la dimensione dell'icona in base al parametro size
  const getSizeClass = () => {
    switch (size) {
      case "small": return "w-6 h-6";
      case "large": return "w-16 h-16";
      case "medium":
      default:
        return "w-12 h-12";
    }
  };

  const iconSize = getSizeClass();
  const fullClassName = `${iconSize} ${className}`;
  
  // Make sure we have a valid iconName
  const safeIconName = iconName || "FileText";
  
  console.log("Rendering icon:", safeIconName, "with size:", iconSize);
  
  // Handle icon name casing - make it match exactly what's imported from lucide-react
  switch (safeIconName.toLowerCase()) {
    case 'filetext': return <FileText className={fullClassName} />;
    case 'image': return <Image className={fullClassName} />;
    case 'messagecircle': return <MessageCircle className={fullClassName} />;
    case 'info': return <Info className={fullClassName} />;
    case 'map': return <Map className={fullClassName} />;
    case 'utensils': return <Utensils className={fullClassName} />;
    case 'landmark': return <Landmark className={fullClassName} />;
    case 'hotel': return <Hotel className={fullClassName} />;
    case 'wifi': return <Wifi className={fullClassName} />;
    case 'bus': return <Bus className={fullClassName} />;
    case 'shoppingbag': return <ShoppingBag className={fullClassName} />;
    case 'calendar': return <Calendar className={fullClassName} />;
    case 'phone': return <Phone className={fullClassName} />;
    case 'coffee': return <Coffee className={fullClassName} />;
    case 'book': return <Book className={fullClassName} />;
    case 'home': return <Home className={fullClassName} />;
    case 'bike': return <Bike className={fullClassName} />;
    case 'camera': return <Camera className={fullClassName} />;
    case 'globe': return <Globe className={fullClassName} />;
    case 'mountain': return <Mountain className={fullClassName} />;
    case 'mappin': return <MapPin className={fullClassName} />;
    case 'newspaper': return <Newspaper className={fullClassName} />;
    case 'music': return <Music className={fullClassName} />;
    case 'heart': return <Heart className={fullClassName} />;
    case 'trees': return <Trees className={fullClassName} />;
    case 'users': return <Users className={fullClassName} />;
    case 'shoppingcart': return <ShoppingCart className={fullClassName} />;
    case 'car': return <Car className={fullClassName} />;
    case 'building': return <Building className={fullClassName} />;
    case 'palmtree': return <Palmtree className={fullClassName} />;
    case 'utensilscrossed': return <UtensilsCrossed className={fullClassName} />;
    case 'bed': return <Bed className={fullClassName} />;
    case 'shirt': return <Shirt className={fullClassName} />;
    case 'key': return <Key className={fullClassName} />;
    case 'pawprint': return <PawPrint className={fullClassName} />;
    case 'partypopper': return <PartyPopper className={fullClassName} />;
    case 'trophy': return <Trophy className={fullClassName} />;
    case 'plane': return <Plane className={fullClassName} />;
    case 'train': return <Train className={fullClassName} />;
    case 'loader': return <Loader2 className={`${fullClassName} animate-spin`} />;
    // Add debugging case to see what icon name was received
    default:
      console.warn(`Unknown icon name: "${safeIconName}"`);
      return <FileText className={fullClassName} />;
  }
};

export default IconRenderer;
