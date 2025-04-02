
import React from "react";
import { Home, MapPin, Info, Coffee, Utensils, Phone, MessageSquare, Book } from "lucide-react";

interface NavIcon {
  icon: React.ReactNode;
  label: string;
}

const icons: NavIcon[] = [
  { icon: <Home className="w-6 h-6" />, label: "Home" },
  { icon: <Info className="w-6 h-6" />, label: "Info" },
  { icon: <MapPin className="w-6 h-6" />, label: "Location" },
  { icon: <Coffee className="w-6 h-6" />, label: "Services" },
  { icon: <Utensils className="w-6 h-6" />, label: "Food" },
  { icon: <Book className="w-6 h-6" />, label: "Activities" },
  { icon: <Phone className="w-6 h-6" />, label: "Contact" },
  { icon: <MessageSquare className="w-6 h-6" />, label: "Support" },
];

const IconNav = () => {
  return (
    <div className="w-full overflow-x-auto bg-white shadow-md">
      <div className="flex justify-center items-center space-x-1 py-4 px-2 min-w-max">
        {icons.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center p-3 cursor-pointer hover:bg-emerald-50 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="bg-gradient-to-br from-teal-100 to-emerald-200 p-3 rounded-full mb-2 text-emerald-700 shadow-sm">
              {item.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
