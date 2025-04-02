
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
  Image,
  Hotel,
  Bike,
  Coffee as CoffeeIcon,
  Map,
  Info
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
  { icon: <Hotel className="w-12 h-12" strokeWidth={1.5} />, label: "Servizi hotel", bgColor: "bg-amber-200", path: "/servizi-hotel" },
  { icon: <CoffeeIcon className="w-12 h-12" strokeWidth={1.5} />, label: "Servizi esterni", bgColor: "bg-green-200", path: "/servizi-esterni" },
  { icon: <Utensils className="w-12 h-12" strokeWidth={1.5} />, label: "Ristorante", bgColor: "bg-purple-200", path: "/ristorante" },
  { icon: <Map className="w-12 h-12" strokeWidth={1.5} />, label: "Scopri il territorio", bgColor: "bg-orange-200", path: "/scopri-territorio" },
  { icon: <MapPin className="w-12 h-12" strokeWidth={1.5} />, label: "Posizione", bgColor: "bg-pink-200", path: "/location" },
  { icon: <Wifi className="w-12 h-12" strokeWidth={1.5} />, label: "Wifi", bgColor: "bg-indigo-200", path: "/wifi" },
  { icon: <Bike className="w-12 h-12" strokeWidth={1.5} />, label: "Attività", bgColor: "bg-red-200", path: "/activities" },
  { icon: <Bus className="w-12 h-12" strokeWidth={1.5} />, label: "Trasporti", bgColor: "bg-emerald-200", path: "/transport" },
  { icon: <ShoppingCart className="w-12 h-12" strokeWidth={1.5} />, label: "Shopping", bgColor: "bg-sky-200", path: "/shopping" },
  { icon: <Phone className="w-12 h-12" strokeWidth={1.5} />, label: "Contatti", bgColor: "bg-yellow-200", path: "/contacts" },
  { icon: <Calendar className="w-12 h-12" strokeWidth={1.5} />, label: "Eventi", bgColor: "bg-lime-200", path: "/events" },
  { icon: <Image className="w-12 h-12" strokeWidth={1.5} />, label: "Galleria", bgColor: "bg-fuchsia-200", path: "/gallery" },
  { icon: <Info className="w-12 h-12" strokeWidth={1.5} />, label: "Info", bgColor: "bg-cyan-200", path: "/info" }
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
