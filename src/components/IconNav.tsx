
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { identifyIconFromTitle } from "@/utils/iconUtils";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";
import { IconData } from "@/hooks/useMenuIcons";
import MenuIconGrid from "./MenuIconGrid";
import ErrorView from "./ErrorView";
import LoadingView from "./LoadingView";

interface IconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  refreshTrigger?: number;
  icons?: IconData[];
}

const IconNav: React.FC<IconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  refreshTrigger = 0, 
  icons: providedIcons 
}) => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(providedIcons ? false : true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const keywordToIconMap = useKeywordToIconMap();

  useEffect(() => {
    console.log("IconNav - refreshTrigger updated:", refreshTrigger);
    
    // Se le icone sono fornite direttamente, usa quelle
    if (providedIcons) {
      console.log("IconNav - Using provided icons:", providedIcons.length);
      const transformedIcons = providedIcons.map(icon => {
        // Formatta i dati nel nostro formato atteso
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
      
      setIcons(transformedIcons);
      setIsLoading(false);
    } else {
      console.log("IconNav - No icons provided, waiting for parent component");
      setIsLoading(false);
    }
  }, [providedIcons, refreshTrigger, keywordToIconMap]);

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

  if (isLoading) {
    return <LoadingView message="Caricamento menu..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3">
      <MenuIconGrid icons={icons} onIconClick={handleIconClick} />
    </div>
  );
};

export default IconNav;
