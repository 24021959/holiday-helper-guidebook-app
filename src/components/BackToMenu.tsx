
import React from "react";
import NavigateBack from "./NavigateBack";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";

interface BackToMenuProps {
  showBackButton?: boolean;
}

const BackToMenu: React.FC<BackToMenuProps> = ({ showBackButton = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();
  
  // Check if we're in a submenu or content page
  const isInSubmenu = location.pathname.startsWith('/submenu/');
  const hasParentPath = location.state?.parentPath;
  
  // Handler for home button
  const handleHomeClick = () => {
    if (language === 'it') {
      navigate('/home');
    } else {
      navigate(`/${language}/home`);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Show back button only in submenus or pages with parent */}
      {(showBackButton && (isInSubmenu || hasParentPath)) && (
        <NavigateBack />
      )}
      
      {/* Always show home button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleHomeClick}
        className="rounded-full h-8 w-8 bg-white/80 hover:bg-white"
      >
        <Home className="h-4 w-4 text-emerald-600" />
      </Button>
    </div>
  );
};

export default BackToMenu;
