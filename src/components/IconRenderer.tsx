
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
  
  switch (safeIconName) {
    case 'FileText': return <FileText className={fullClassName} />;
    case 'Image': return <Image className={fullClassName} />;
    case 'MessageCircle': return <MessageCircle className={fullClassName} />;
    case 'Info': return <Info className={fullClassName} />;
    case 'Map': return <Map className={fullClassName} />;
    case 'Utensils': return <Utensils className={fullClassName} />;
    case 'Landmark': return <Landmark className={fullClassName} />;
    case 'Hotel': return <Hotel className={fullClassName} />;
    case 'Wifi': return <Wifi className={fullClassName} />;
    case 'Bus': return <Bus className={fullClassName} />;
    case 'ShoppingBag': return <ShoppingBag className={fullClassName} />;
    case 'Calendar': return <Calendar className={fullClassName} />;
    case 'Phone': return <Phone className={fullClassName} />;
    case 'Coffee': return <Coffee className={fullClassName} />;
    case 'Book': return <Book className={fullClassName} />;
    case 'Home': return <Home className={fullClassName} />;
    case 'Bike': return <Bike className={fullClassName} />;
    case 'Camera': return <Camera className={fullClassName} />;
    case 'Globe': return <Globe className={fullClassName} />;
    case 'Mountain': return <Mountain className={fullClassName} />;
    case 'MapPin': return <MapPin className={fullClassName} />;
    case 'Newspaper': return <Newspaper className={fullClassName} />;
    case 'Music': return <Music className={fullClassName} />;
    case 'Heart': return <Heart className={fullClassName} />;
    case 'Trees': return <Trees className={fullClassName} />;
    case 'Users': return <Users className={fullClassName} />;
    case 'ShoppingCart': return <ShoppingCart className={fullClassName} />;
    case 'Car': return <Car className={fullClassName} />;
    case 'Building': return <Building className={fullClassName} />;
    case 'Palmtree': return <Palmtree className={fullClassName} />;
    case 'UtensilsCrossed': return <UtensilsCrossed className={fullClassName} />;
    case 'Bed': return <Bed className={fullClassName} />;
    case 'Shirt': return <Shirt className={fullClassName} />;
    case 'Key': return <Key className={fullClassName} />;
    case 'PawPrint': return <PawPrint className={fullClassName} />;
    case 'PartyPopper': return <PartyPopper className={fullClassName} />;
    case 'Trophy': return <Trophy className={fullClassName} />;
    case 'Plane': return <Plane className={fullClassName} />;
    case 'Train': return <Train className={fullClassName} />;
    case 'Loader': return <Loader2 className={`${fullClassName} animate-spin`} />;
    default: return <FileText className={fullClassName} />;
  }
};

export default IconRenderer;
