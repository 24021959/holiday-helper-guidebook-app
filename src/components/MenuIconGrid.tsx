
import React from "react";
import MenuIcon from "./MenuIcon";
import EmptyIconGrid from "./menu/EmptyIconGrid";
import { IconData } from "@/hooks/menu/types";
import { useNavigate } from "react-router-dom";

interface MenuIconGridProps {
  icons: IconData[];
  onIconClick: (icon: IconData) => void;
}

const MenuIconGrid: React.FC<MenuIconGridProps> = ({ icons, onIconClick }) => {
  if (icons.length === 0) {
    return <EmptyIconGrid />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 h-full">
      {icons.map((icon, index) => (
        <MenuIcon 
          key={icon.id} 
          icon={icon} 
          index={index} 
          onClick={onIconClick} 
        />
      ))}
    </div>
  );
};

export default MenuIconGrid;
