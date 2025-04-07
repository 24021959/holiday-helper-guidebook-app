
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import TranslatedText from "./TranslatedText";

interface NavigateBackProps {
  parentPath?: string | null;
}

const NavigateBack: React.FC<NavigateBackProps> = ({ parentPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in a path that starts with /submenu/
  const isInSubmenu = location.pathname.startsWith('/submenu/');
  
  // Check if we're in a content page inside a submenu path
  const isInSubmenuContentPage = !isInSubmenu && location.state?.parentPath;
  
  console.log("NavigateBack - Current path:", location.pathname);
  console.log("NavigateBack - Parent path:", parentPath);
  console.log("NavigateBack - Location state:", location.state);
  
  const handleBack = () => {
    try {
      if (isInSubmenuContentPage && location.state?.parentPath) {
        // If we're in a content page that was accessed from a submenu, go back to that submenu
        console.log("Navigating back to submenu:", location.state.parentPath);
        navigate(`/submenu${location.state.parentPath}`);
      } else if (parentPath) {
        // If we have a parent path, navigate to its submenu
        console.log("Navigating to parent path submenu:", parentPath);
        navigate(`/submenu${parentPath}`);
      } else if (isInSubmenu) {
        // If we're in a submenu but don't have parent info, go to menu
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
      {isInSubmenuContentPage ? (
        <TranslatedText text="Indietro" />
      ) : (
        isInSubmenu || parentPath ? (
          <TranslatedText text="Indietro" />
        ) : (
          <TranslatedText text="Torna al Menu" />
        )
      )}
    </Button>
  );
};

export default NavigateBack;
