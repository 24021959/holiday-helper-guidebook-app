
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import TranslatedText from "./TranslatedText";

interface NavigateBackProps {
  parentPath?: string | null;
}

const NavigateBack: React.FC<NavigateBackProps> = ({ parentPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { parentPath: urlParentPath } = useParams<{ parentPath: string }>();
  
  // Check if we're in a path that starts with /submenu/
  const isInSubmenu = location.pathname.startsWith('/submenu/');
  
  // Check if we're in a content page inside a submenu path
  const isInSubmenuContentPage = !isInSubmenu && location.state?.parentPath;
  
  useEffect(() => {
    console.log("NavigateBack - Current path:", location.pathname);
    console.log("NavigateBack - Parent path from props:", parentPath);
    console.log("NavigateBack - Parent path from URL:", urlParentPath);
    console.log("NavigateBack - Location state:", location.state);
  }, [location, parentPath, urlParentPath]);
  
  const handleBack = () => {
    try {
      if (isInSubmenuContentPage && location.state?.parentPath) {
        // If we're in a content page that was accessed from a submenu, go back to that submenu
        console.log("Navigating back to submenu:", location.state.parentPath);
        
        // Extract the path part after /submenu/
        const submenuPath = location.state.parentPath.startsWith('/') 
          ? location.state.parentPath.substring(1) 
          : location.state.parentPath;
        
        navigate(`/submenu/${submenuPath}`);
      } else if (isInSubmenu) {
        // If we're in a submenu, go back to menu
        console.log("Navigating back to main menu from submenu");
        navigate("/menu");
      } else {
        // Default fallback to main menu
        console.log("Navigating to main menu (default fallback)");
        navigate("/menu");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to menu in case of any navigation error
      navigate("/menu");
    }
  };

  return (
    <Button
      variant="ghost"
      className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
      onClick={handleBack}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      <TranslatedText text="Back" />
    </Button>
  );
};

export default NavigateBack;
