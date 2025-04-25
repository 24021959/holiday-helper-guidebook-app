
import React from "react";
import IconRenderer from "./IconRenderer";
import TranslatedText from "./TranslatedText";
import { IconData } from "@/hooks/menu/types";
import { cn } from "@/lib/utils";

interface MenuIconProps {
  icon: IconData;
  index: number;
  onClick: (icon: IconData) => void;
}

const MenuIcon: React.FC<MenuIconProps> = ({ icon, index, onClick }) => {
  // Color scheme based on parent status
  const colorClasses = icon.is_parent 
    ? 'border-2 border-emerald-300 bg-gradient-to-br from-white to-emerald-50'
    : 'bg-white';
    
  const displayTitle = icon.title || icon.label || "";
  
  return (
    <div 
      key={icon.id}
      className={cn(
        "flex flex-col items-center justify-center",
        colorClasses,
        "rounded-xl shadow-md p-6 cursor-pointer",
        "transition-transform hover:scale-105 active:scale-95 h-full"
      )}
      onClick={() => onClick(icon)}
    >
      <div className="p-3 mb-4 rounded-full bg-gray-50 text-emerald-600">
        <IconRenderer iconName={icon.icon || "FileText"} size="medium" />
      </div>
      <span className="text-center text-gray-700 font-medium text-lg">
        {icon.translations ? (
          <TranslatedText 
            text={displayTitle}
            translations={icon.translations}
          />
        ) : (
          <TranslatedText text={displayTitle} />
        )}
      </span>
    </div>
  );
};

export default MenuIcon;
