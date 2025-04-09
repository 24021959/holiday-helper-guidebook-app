
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuIconGrid from "./MenuIconGrid";
import { identifyIconFromTitle } from "@/utils/iconUtils";
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";
import { IconData } from "@/hooks/useMenuIcons";
import TranslatedText from "./TranslatedText";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/context/TranslationContext";

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
  const { language } = useTranslation();

  useEffect(() => {
    console.log("IconNav - Received", icons.length, "icons with parentPath:", parentPath);
    console.log("IconNav - Current language:", language);
    
    if (icons.length > 0) {
      console.log("IconNav - First icon details:", JSON.stringify(icons[0]));
    }
    
    if (parentPath) {
      console.log("IconNav - All subpages under parent:", parentPath);
    }
  }, [icons, parentPath, language]);

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
      // Prepare language prefix for paths, but only for non-Italian languages
      const langPrefix = language !== 'it' ? `/${language}` : '';
      
      // Check if this is a parent page (has subpages)
      if (icon.is_parent) {
        console.log("Navigation to submenu for parent:", icon.path);
        
        // Check if the path already contains a language prefix
        if (icon.path.match(/^\/[a-z]{2}\//)) {
          // Path already has language prefix, like /en/services
          // Extract the language and path
          const pathParts = icon.path.split('/');
          const pathLang = pathParts[1];
          const pathRest = pathParts.slice(2).join('/');
          
          console.log(`Path has language prefix: ${pathLang}, rest: ${pathRest}`);
          navigate(`/submenu/${pathLang}/${pathRest}`);
        } else {
          // Path doesn't have language prefix
          // Extract path without initial slash for the URL parameter
          let pathParam = icon.path.startsWith('/') ? icon.path.substring(1) : icon.path;
          
          // For non-Italian languages, we need to include the language in the URL
          if (language !== 'it') {
            navigate(`/submenu/${language}/${pathParam}`);
          } else {
            navigate(`/submenu/${pathParam}`);
          }
        }
        return;
      }
      
      // For system routes, navigate directly
      const systemRoutes = ['/menu', '/admin', '/home', '/login', '/welcome'];
      if (systemRoutes.includes(icon.path)) {
        console.log("Navigation to system route:", icon.path);
        
        // For system routes like /menu, add language prefix
        if (language !== 'it' && icon.path === '/menu') {
          navigate(`${langPrefix}${icon.path}`);
        } else {
          navigate(icon.path);
        }
        return;
      }
      
      // For content paths, check if the path already has a language prefix
      let contentPath = icon.path;
      
      // If language is not Italian and the path doesn't already start with the language prefix
      if (language !== 'it' && !contentPath.startsWith(`/${language}`)) {
        // Look for a localized version of the page
        console.log(`Looking for localized version of page: ${langPrefix}${contentPath}`);
        contentPath = `${langPrefix}${contentPath}`;
      }
      
      console.log("Navigation to content page:", contentPath);
      navigate(contentPath, { 
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
