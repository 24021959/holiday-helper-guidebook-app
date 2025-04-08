
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuIconGrid from "./MenuIconGrid";
import { identifyIconFromTitle } from "@/utils/iconUtils";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";
import { IconData } from "@/hooks/useMenuIcons";
import TranslatedText from "./TranslatedText";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log("IconNav - Received", icons.length, "icons with parentPath:", parentPath);
    
    if (icons.length > 0) {
      console.log("IconNav - First icon details:", JSON.stringify(icons[0]));
    }
    
    if (parentPath) {
      console.log("IconNav - All subpages under parent:", parentPath);
    }
  }, [icons, parentPath]);

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
      label: icon.label || title,
      published: icon.published
    };
  });

  // Remove any duplicate icons based on path and ensure only published icons
  const uniqueIcons = Array.from(
    new Map(formattedIcons
      .filter(icon => icon.published !== false) // Keep only published icons
      .map(icon => [icon.path, icon])
    ).values()
  );

  const handleIconClick = (icon: IconData) => {
    console.log("Clicked on icon:", icon);
    
    try {
      // Check if this is a parent page (has subpages)
      if (icon.is_parent) {
        console.log("Navigation to submenu for parent:", icon.path);
        // Extract path without initial slash for the URL parameter
        const pathParam = icon.path.startsWith('/') ? icon.path.substring(1) : icon.path;
        navigate(`/submenu/${pathParam}`);
        return;
      }
      
      // For system routes, navigate directly
      const systemRoutes = ['/menu', '/admin', '/home', '/login', '/welcome'];
      if (systemRoutes.includes(icon.path)) {
        console.log("Navigation to system route:", icon.path);
        navigate(icon.path);
        return;
      }
      
      // For content pages, navigate directly to the path of the page
      // and pass the parent path in the state for proper "back" navigation
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
    <div className={`flex-1 flex flex-col ${isMobile ? 'p-1' : 'p-3'}`}>
      <MenuIconGrid icons={uniqueIcons} onIconClick={handleIconClick} />
    </div>
  );
};

export default IconNav;
