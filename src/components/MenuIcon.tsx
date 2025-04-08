
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
  
  return (
    <div 
      key={icon.id}
      className={`flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 cursor-pointer transition-transform hover:scale-105 active:scale-95 h-full ${icon.is_parent ? 'border-2 border-emerald-300' : ''}`}
      onClick={() => onClick(icon)}
    >
      <div className={`${colorScheme.bg} p-5 mb-4 rounded-full ${colorScheme.text} flex items-center justify-center`}>
        <IconRenderer iconName={icon.icon} />
      </div>
      <span className="text-center text-gray-700 font-medium text-lg">
        <TranslatedText text={icon.title || icon.label || ""} />
      </span>
      {icon.is_parent && (
        <span className="mt-2 text-xs text-emerald-600 font-medium">
          <TranslatedText text="Contiene sottopagine" />
        </span>
      )}
    </div>
  );
};

export default MenuIcon;
