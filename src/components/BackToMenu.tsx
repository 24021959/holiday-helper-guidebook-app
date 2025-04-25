
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";
import TranslatedText from "./TranslatedText";

interface BackToMenuProps {
  showBackButton?: boolean;
  parentPath?: string;
}

const BackToMenu: React.FC<BackToMenuProps> = ({ 
  showBackButton = true,
  parentPath 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();
  
  // Determina se siamo in una sottopagina
  const isSubPage = parentPath || location.pathname.split('/').filter(Boolean).length > 1;
  
  // Gestisce il ritorno alla home
  const handleHomeClick = () => {
    if (language === 'it') {
      navigate('/home');
    } else {
      navigate(`/${language}/home`);
    }
  };
  
  // Gestisce il ritorno alla pagina precedente
  const handleBack = () => {
    if (parentPath) {
      navigate(parentPath);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {showBackButton && isSubPage && (
        <Button
          variant="ghost"
          className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <TranslatedText text="Back" />
        </Button>
      )}
      
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
