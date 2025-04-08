
import React from "react";
import NavigateBack from "./NavigateBack";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Home } from "lucide-react";

const BackToMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handler for home button
  const handleHomeClick = () => {
    navigate('/menu');
  };
  
  return (
    <div className="flex items-center gap-2">
      <NavigateBack />
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
