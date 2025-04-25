
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
  
  // Verifica se siamo nella home page
  const isHomePage = location.pathname === '/home' || 
                    location.pathname === `/${language}/home` ||
                    location.pathname === '/';
  
  // Verifica se siamo in una sottopagina o pagina con contenuto
  const isInSubmenu = location.pathname.startsWith('/submenu/');
  const hasParentPath = location.state?.parentPath;
  
  // Gestore per il pulsante home
  const handleHomeClick = () => {
    if (language === 'it') {
      navigate('/home');
    } else {
      navigate(`/${language}/home`);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Mostra il pulsante indietro solo nelle sottopagine o pagine con parent */}
      {(showBackButton && (isInSubmenu || hasParentPath)) && (
        <NavigateBack />
      )}
      
      {/* Mostra il pulsante home solo se NON siamo nella home page */}
      {!isHomePage && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleHomeClick}
          className="rounded-full h-8 w-8 bg-white/80 hover:bg-white"
        >
          <Home className="h-4 w-4 text-emerald-600" />
        </Button>
      )}
    </div>
  );
};

export default BackToMenu;
