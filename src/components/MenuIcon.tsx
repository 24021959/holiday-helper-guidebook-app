
import React from "react";
import IconRenderer from "./IconRenderer";
import TranslatedText from "./TranslatedText";
import { pastelColors } from "@/utils/iconUtils";
import { IconData } from "@/hooks/useMenuIcons";

interface MenuIconProps {
  icon: IconData;
  index: number;
  onClick: (icon: IconData) => void;
}

const MenuIcon: React.FC<MenuIconProps> = ({ icon, index, onClick }) => {
  // Select a color based on the index
  const colorIndex = index % pastelColors.length;
  const colorScheme = pastelColors[colorIndex];
  
  // Debug information
  console.log(`MenuIcon rendering - Icon:`, icon);
  
  // Special style for parent items that contain subpages
  const parentStyle = icon.is_parent 
    ? 'border-2 border-emerald-300 bg-gradient-to-br from-white to-emerald-50'
    : 'bg-white';
  
  return (
    <div 
      key={icon.id}
      className={`flex flex-col items-center justify-center ${parentStyle} rounded-xl shadow-md p-6 cursor-pointer transition-transform hover:scale-105 active:scale-95 h-full`}
      onClick={() => onClick(icon)}
    >
      <div className={`${colorScheme.bg} p-5 mb-4 rounded-full ${colorScheme.text} flex items-center justify-center`}>
        <IconRenderer iconName={icon.icon} />
      </div>
      <span className="text-center text-gray-700 font-medium text-lg">
        <TranslatedText text={icon.title || icon.label || ""} />
      </span>
      {icon.is_parent && (
        <span className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <TranslatedText text="Contiene sottopagine" />
        </span>
      )}
    </div>
  );
};

export default MenuIcon;
