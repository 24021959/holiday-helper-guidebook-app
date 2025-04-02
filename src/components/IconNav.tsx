
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
  bgColor: string;
}

const icons: NavIcon[] = [
  { icon: <Home className="w-8 h-8" strokeWidth={1.5} />, label: "Benvenuto", bgColor: "bg-blue-100" },
  { icon: <Coffee className="w-8 h-8" strokeWidth={1.5} />, label: "Check-in", bgColor: "bg-amber-100" },
  { icon: <MapPin className="w-8 h-8" strokeWidth={1.5} />, label: "Posizione", bgColor: "bg-green-100" },
  { icon: <Wifi className="w-8 h-8" strokeWidth={1.5} />, label: "Wifi", bgColor: "bg-purple-100" },
  { icon: <Bus className="w-8 h-8" strokeWidth={1.5} />, label: "Trasporti", bgColor: "bg-orange-100" },
  { icon: <Info className="w-8 h-8" strokeWidth={1.5} />, label: "Info", bgColor: "bg-teal-100" },
  { icon: <Utensils className="w-8 h-8" strokeWidth={1.5} />, label: "Attività", bgColor: "bg-pink-100" },
  { icon: <Book className="w-8 h-8" strokeWidth={1.5} />, label: "Equipaggiamenti", bgColor: "bg-indigo-100" },
  { icon: <ShoppingCart className="w-8 h-8" strokeWidth={1.5} />, label: "Shopping", bgColor: "bg-red-100" },
  { icon: <Phone className="w-8 h-8" strokeWidth={1.5} />, label: "Contatti", bgColor: "bg-emerald-100" },
  { icon: <MessageSquare className="w-8 h-8" strokeWidth={1.5} />, label: "Messaggi", bgColor: "bg-sky-100" },
  { icon: <User className="w-8 h-8" strokeWidth={1.5} />, label: "Profilo", bgColor: "bg-yellow-100" },
  { icon: <Calendar className="w-8 h-8" strokeWidth={1.5} />, label: "Eventi", bgColor: "bg-lime-100" },
  { icon: <Settings className="w-8 h-8" strokeWidth={1.5} />, label: "Impostazioni", bgColor: "bg-cyan-100" },
  { icon: <Image className="w-8 h-8" strokeWidth={1.5} />, label: "Galleria", bgColor: "bg-fuchsia-100" }
];

const IconNav = () => {
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="grid grid-cols-3 gap-3 w-full h-full p-3">
        {icons.map((item, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center justify-center aspect-square cursor-pointer ${item.bgColor} rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-white/50`}
          >
            <div className="bg-white rounded-full mb-2 p-4 shadow-md flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
