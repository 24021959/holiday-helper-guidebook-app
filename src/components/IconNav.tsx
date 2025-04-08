
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

  // Format icons for component use
  const formattedIcons = icons.map(icon => {
    let iconName = icon.icon;
    const title = icon.title || icon.label || "";
    
    // Auto-detect appropriate icon if current one is generic
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
    console.log("Clicked on icon:", icon);
    
    try {
      // Check if this is a parent page (has subpages)
      if (icon.is_parent) {
        console.log("Navigation to submenu for parent:", icon.path);
        // Extract path without initial slash for the URL parameter
        const pathParam = icon.path.startsWith('/') ? icon.path.substring(1) : icon.path;
        navigate(`/submenu/${pathParam}`);
      } else {
        // For regular pages without submenu, check if it's a regular page or dynamic page
        const isReservedPath = ['/menu', '/admin', '/home', '/login'].includes(icon.path);
        
        if (isReservedPath) {
          // For reserved system pages, navigate directly to those routes
          console.log("Navigation to system page:", icon.path);
          navigate(icon.path);
        } else {
          // For dynamic pages, navigate to the direct path with parent path in state
          console.log("Navigation to dynamic content page:", icon.path);
          navigate(icon.path, { 
            state: { 
              parentPath: parentPath 
            } 
          });
        }
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      <MenuIconGrid icons={formattedIcons} onIconClick={handleIconClick} />
    </div>
  );
};

export default IconNav;
