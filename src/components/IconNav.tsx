
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuIconGrid from "./MenuIconGrid";
import ErrorView from "./ErrorView";
import LoadingView from "./LoadingView";
import { IconData } from "@/hooks/useMenuIcons";
import { identifyIconFromTitle } from "@/utils/iconUtils";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

interface IconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  refreshTrigger?: number;
  icons?: IconData[];
}

const IconNav: React.FC<IconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  icons: providedIcons = []
}) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const keywordToIconMap = useKeywordToIconMap();

  // Formatta le icone fornite per l'uso nel componente
  const formattedIcons = providedIcons.map(icon => {
    // Controlla se l'icona è un genitore
    const isParent = providedIcons.some(item => item.parent_path === icon.path);
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
      is_parent: isParent,
      label: icon.label || title
    };
  });

  const handleIconClick = (icon: IconData) => {
    if (icon.is_parent) {
      console.log("Navigating to submenu:", icon.path);
      navigate(`/submenu${icon.path}`);
    } else {
      console.log("Navigating to page:", icon.path);
      navigate(icon.path, { 
        state: { 
          parentPath: parentPath 
        } 
      });
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      console.log("IconNav - Refresh requested, calling parent refresh handler");
      onRefresh();
    }
  };

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRefresh={handleRefresh}
      />
    );
  }

  // Semplificato - non controlla più se isLoading, usa direttamente le icone fornite
  return (
    <div className="flex-1 flex flex-col p-3">
      <MenuIconGrid icons={formattedIcons} onIconClick={handleIconClick} />
    </div>
  );
};

export default IconNav;
