
import React from "react";
import MenuIconGrid from "./MenuIconGrid";
import { IconData } from "@/hooks/menu/types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/context/TranslationContext";

interface IconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  icons: IconData[];
}

const IconNav: React.FC<IconNavProps> = ({ 
  parentPath, 
  onRefresh,
  icons
}) => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  const handleIconClick = (icon: IconData) => {
    console.log("Clicked on icon:", icon);
    
    try {
      // Check if this is a parent page (has subpages)
      if (icon.is_parent) {
        console.log("Navigation to submenu for parent:", icon.path);
        
        // Extract path without initial slash for the URL parameter
        let pathParam = icon.path.startsWith('/') ? icon.path.substring(1) : icon.path;
        
        // For language-specific paths, use the language prefix
        if (language !== 'it' && !pathParam.startsWith(language)) {
          navigate(`/submenu/${pathParam}`);
        } else {
          navigate(`/submenu/${pathParam}`);
        }
        return;
      }
      
      // For system routes, navigate directly
      const systemRoutes = ['/menu', '/admin', '/home', '/login', '/welcome'];
      if (systemRoutes.includes(icon.path)) {
        console.log("Navigation to system route:", icon.path);
        navigate(icon.path);
        return;
      }
      
      // For direct content navigation
      console.log("Navigation to content page:", icon.path);
      navigate(icon.path, { 
        state: { 
          parentPath: parentPath 
        } 
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      <MenuIconGrid icons={icons} onIconClick={handleIconClick} />
    </div>
  );
};

export default IconNav;
