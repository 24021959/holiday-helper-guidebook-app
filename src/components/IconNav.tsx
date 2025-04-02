
import React from "react";
import { 
  Home, 
  MapPin, 
  Info, 
  Coffee, 
  Utensils, 
  Phone, 
  MessageSquare, 
  Book,
  Wifi, 
  Bus, 
  ShoppingCart,
  User,
  Calendar,
  Settings,
  Image
} from "lucide-react";

interface NavIcon {
  icon: React.ReactNode;
  label: string;
}

const icons: NavIcon[] = [
  { icon: <Home className="w-6 h-6" />, label: "Benvenuto" },
  { icon: <Coffee className="w-6 h-6" />, label: "Check-in" },
  { icon: <MapPin className="w-6 h-6" />, label: "Posizione" },
  { icon: <Wifi className="w-6 h-6" />, label: "Wifi" },
  { icon: <Bus className="w-6 h-6" />, label: "Trasporti" },
  { icon: <Info className="w-6 h-6" />, label: "Info" },
  { icon: <Utensils className="w-6 h-6" />, label: "Attività" },
  { icon: <Book className="w-6 h-6" />, label: "Equipaggiamenti" },
  { icon: <ShoppingCart className="w-6 h-6" />, label: "Shopping" },
  { icon: <Phone className="w-6 h-6" />, label: "Contatti" },
  { icon: <MessageSquare className="w-6 h-6" />, label: "Messaggi" },
  { icon: <User className="w-6 h-6" />, label: "Profilo" },
  { icon: <Calendar className="w-6 h-6" />, label: "Eventi" },
  { icon: <Settings className="w-6 h-6" />, label: "Impostazioni" },
  { icon: <Image className="w-6 h-6" />, label: "Galleria" }
];

const IconNav = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-3 gap-4 w-full h-full p-4">
        {icons.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="bg-white rounded-full mb-1 p-3 shadow-md flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
