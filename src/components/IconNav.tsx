
import React from "react";
import { useNavigate } from "react-router-dom";
import MenuIconGrid from "./MenuIconGrid";
import { identifyIconFromTitle } from "@/utils/iconUtils";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

interface IconData {
  id: string;
  path: string;
  label: string;
  icon: string;
  parent_path: string | null;
  title?: string;
  is_parent?: boolean;
}

interface IconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  icons: IconData[];
}

const IconNav: React.FC<IconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  icons = []
}) => {
  const navigate = useNavigate();
  const keywordToIconMap = useKeywordToIconMap();

  // Formatta le icone fornite per l'uso nel componente
  const formattedIcons = icons.map(icon => {
    let iconName = icon.icon;
    const title = icon.title || icon.label || "";
    
    // Rileva automaticamente icona più adatta se quella attuale è generica
    if (iconName === "FileText" || !iconName) {
      iconName = identifyIconFromTitle(title, keywordToIconMap);
    }
    
    return {
      id: icon.id,
      title: title,
      icon: iconName,
      path: icon.path,
      parent_path: icon.parent_path,
      is_parent: icon.is_parent,
      label: icon.label || title
    };
  });

  const handleIconClick = (icon: IconData) => {
    // Determina se questa icona ha sottopagine
    if (icon.path && icon.path.startsWith('/')) {
      // Estrai la parte del percorso senza lo slash iniziale
      const pathWithoutSlash = icon.path.substring(1);
      console.log("Navigating to:", pathWithoutSlash);
      
      // Se è un genitore, naviga al sottomenu
      if (icon.is_parent) {
        console.log("Navigating to submenu:", pathWithoutSlash);
        navigate(`/submenu/${pathWithoutSlash}`);
      } else {
        // Altrimenti, naviga alla pagina
        console.log("Navigating to page:", icon.path);
        navigate(icon.path, { 
          state: { 
            parentPath: parentPath 
          } 
        });
      }
    } else {
      console.log("Invalid path:", icon.path);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      console.log("IconNav - Refresh requested, calling parent refresh handler");
      onRefresh();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      <MenuIconGrid icons={formattedIcons} onIconClick={handleIconClick} />
    </div>
  );
};

export default IconNav;
