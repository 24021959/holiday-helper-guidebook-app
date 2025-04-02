
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
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center items-center space-x-4 py-4 px-2 min-w-max">
        {icons.map((item, index) => (
          <div key={index} className="flex flex-col items-center p-2 cursor-pointer hover:bg-gray-100 rounded-lg">
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconNav;
