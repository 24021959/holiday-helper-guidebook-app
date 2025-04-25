
import React from "react";
import MenuIcon from "./MenuIcon";
import EmptyIconGrid from "./menu/EmptyIconGrid";
import { IconData } from "@/hooks/menu/types";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuIconGridProps {
  icons: IconData[];
  onIconClick: (icon: IconData) => void;
}

const MenuIconGrid: React.FC<MenuIconGridProps> = ({ icons, onIconClick }) => {
  const navigate = useNavigate();
  
  // Aggiungiamo l'icona della casa come prima icona
  const welcomeIcon: IconData = {
    id: "welcome",
    title: "Benvenuto",
    path: "/welcome",
    icon: "Home",
    is_parent: false,
    translations: {
      it: "Benvenuto",
      en: "Welcome",
      fr: "Bienvenue",
      es: "Bienvenido",
      de: "Willkommen"
    }
  };

  if (icons.length === 0 && !welcomeIcon) {
    return <EmptyIconGrid />;
  }

  // Aggiungiamo l'icona della casa all'inizio dell'array
  const allIcons = [welcomeIcon, ...icons];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 h-full">
      {allIcons.map((icon, index) => (
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

