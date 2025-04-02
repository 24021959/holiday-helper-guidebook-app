
import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  MapPin, 
  Book, 
  Coffee, 
  Utensils, 
  Phone, 
  MessageSquare, 
  User,
  Wifi, 
  Bus, 
  ShoppingCart,
  Calendar,
  Settings,
  Image
} from "lucide-react";

interface NavIcon {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  path: string;
}

const icons: NavIcon[] = [
  { icon: <Home className="w-12 h-12" strokeWidth={1.5} />, label: "Benvenuto", bgColor: "bg-blue-200", path: "/welcome" },
  { icon: <Book className="w-12 h-12" strokeWidth={1.5} />, label: "Storia", bgColor: "bg-teal-200", path: "/storia" },
  { icon: <Coffee className="w-12 h-12" strokeWidth={1.5} />, label: "Check-in", bgColor: "bg-amber-200", path: "/checkin" },
  { icon: <MapPin className="w-12 h-12" strokeWidth={1.5} />, label: "Posizione", bgColor: "bg-green-200", path: "/location" },
  { icon: <Wifi className="w-12 h-12" strokeWidth={1.5} />, label: "Wifi", bgColor: "bg-purple-200", path: "/wifi" },
  { icon: <Bus className="w-12 h-12" strokeWidth={1.5} />, label: "Trasporti", bgColor: "bg-orange-200", path: "/transport" },
  { icon: <Utensils className="w-12 h-12" strokeWidth={1.5} />, label: "Attività", bgColor: "bg-pink-200", path: "/activities" },
  { icon: <User className="w-12 h-12" strokeWidth={1.5} />, label: "Equipaggiamenti", bgColor: "bg-indigo-200", path: "/equipment" },
  { icon: <ShoppingCart className="w-12 h-12" strokeWidth={1.5} />, label: "Shopping", bgColor: "bg-red-200", path: "/shopping" },
  { icon: <Phone className="w-12 h-12" strokeWidth={1.5} />, label: "Contatti", bgColor: "bg-emerald-200", path: "/contacts" },
  { icon: <MessageSquare className="w-12 h-12" strokeWidth={1.5} />, label: "Messaggi", bgColor: "bg-sky-200", path: "/messages" },
  { icon: <User className="w-12 h-12" strokeWidth={1.5} />, label: "Profilo", bgColor: "bg-yellow-200", path: "/profile" },
  { icon: <Calendar className="w-12 h-12" strokeWidth={1.5} />, label: "Eventi", bgColor: "bg-lime-200", path: "/events" },
  { icon: <Settings className="w-12 h-12" strokeWidth={1.5} />, label: "Impostazioni", bgColor: "bg-cyan-200", path: "/settings" },
  { icon: <Image className="w-12 h-12" strokeWidth={1.5} />, label: "Galleria", bgColor: "bg-fuchsia-200", path: "/gallery" }
];

const IconNav = () => {
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
              {item.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
