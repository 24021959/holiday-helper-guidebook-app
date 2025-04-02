
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
  ShoppingCart
} from "lucide-react";

interface NavIcon {
  icon: React.ReactNode;
  label: string;
}

const icons: NavIcon[] = [
  { icon: <Home className="w-8 h-8" />, label: "Benvenuto" },
  { icon: <Coffee className="w-8 h-8" />, label: "Check-in" },
  { icon: <MapPin className="w-8 h-8" />, label: "Posizione" },
  { icon: <Wifi className="w-8 h-8" />, label: "Wifi" },
  { icon: <Bus className="w-8 h-8" />, label: "Trasporti" },
  { icon: <Info className="w-8 h-8" />, label: "Info" },
  { icon: <Utensils className="w-8 h-8" />, label: "Attività" },
  { icon: <Book className="w-8 h-8" />, label: "Equipaggiamenti" },
  { icon: <ShoppingCart className="w-8 h-8" />, label: "Shopping" }
];

const IconNav = () => {
  return (
    <div className="w-full bg-white p-4">
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {icons.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="bg-white rounded-full mb-2 p-4 shadow-lg flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 mt-2 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
