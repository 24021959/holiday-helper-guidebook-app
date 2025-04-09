
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
      // Prepara il prefisso della lingua per i percorsi, ma solo per lingue diverse dall'italiano
      const langPrefix = language !== 'it' ? `/${language}` : '';
      
      // Check if this is a parent page (has subpages)
      if (icon.is_parent) {
        console.log("Navigation to submenu for parent:", icon.path);
        // Extract path without initial slash for the URL parameter
        let pathParam = icon.path.startsWith('/') ? icon.path.substring(1) : icon.path;
        
        // Se la pagina non inizia già con il prefisso lingua (es. /en/), aggiungi il prefisso
        if (language !== 'it' && !pathParam.startsWith(`${language}/`)) {
          navigate(`/submenu/${language}/${pathParam}`);
        } else {
          navigate(`/submenu/${pathParam}`);
        }
        return;
      }
      
      // For system routes, navigate directly
      const systemRoutes = ['/menu', '/admin', '/home', '/login', '/welcome'];
      if (systemRoutes.includes(icon.path)) {
        console.log("Navigation to system route:", icon.path);
        
        // Per le rotte di sistema come /menu, aggiungi il prefisso lingua
        if (language !== 'it' && icon.path === '/menu') {
          navigate(`${langPrefix}${icon.path}`);
        } else {
          navigate(icon.path);
        }
        return;
      }
      
      // Per i percorsi di contenuto, controlla se il percorso ha già il prefisso lingua
      let contentPath = icon.path;
      
      // Se la lingua non è italiano e il percorso non inizia già con il prefisso lingua
      if (language !== 'it' && !contentPath.startsWith(`/${language}`)) {
        // Cerca se esiste una versione localizzata della pagina
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
