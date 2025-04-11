
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import TranslatedText from "./TranslatedText";
import { useTranslation } from "@/context/TranslationContext";

interface NavigateBackProps {
  parentPath?: string | null;
  onNavigateForward?: () => void;
  canNavigateForward?: boolean;
}

const NavigateBack: React.FC<NavigateBackProps> = ({ 
  parentPath, 
  onNavigateForward,
  canNavigateForward = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { parentPath: urlParentPath } = useParams<{ parentPath: string }>();
  const { language } = useTranslation();
  
  // Check if we're in a path that starts with /submenu/
  const isInSubmenu = location.pathname.startsWith('/submenu/');
  
  // Check if we're in a content page inside a submenu path
  const isInSubmenuContentPage = !isInSubmenu && location.state?.parentPath;
  
  // For debugging - log information about our current navigation state
  useEffect(() => {
    console.log("NavigateBack - Current path:", location.pathname);
    console.log("NavigateBack - Parent path from props:", parentPath);
    console.log("NavigateBack - Parent path from URL:", urlParentPath);
    console.log("NavigateBack - Location state:", location.state);
    console.log("NavigateBack - Current language:", language);
    
    // Check if this is a nested path like /servizi-hotel/reception
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      console.log("NavigateBack - Detected nested path with segments:", pathSegments);
    }
  }, [location, parentPath, urlParentPath, language]);
  
  const handleBack = () => {
    try {
      // Detect language prefix in current path
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const hasLanguagePrefix = ['en', 'fr', 'es', 'de'].includes(pathSegments[0]);
      
      // Detect nested paths like /servizi-hotel/reception or /en/servizi-hotel/reception
      if (pathSegments.length >= 2) {
        console.log("Handling navigation for nested path with segments:", pathSegments);
        
        if (hasLanguagePrefix && pathSegments.length >= 3) {
          // With language prefix: /en/servizi-hotel/reception -> /submenu/en/servizi-hotel
          const lang = pathSegments[0];
          const parent = pathSegments[1];
          console.log(`Navigating back to submenu with language: /submenu/${lang}/${parent}`);
          navigate(`/submenu/${lang}/${parent}`);
          return;
        } else if (pathSegments.length >= 2 && !hasLanguagePrefix) {
          // Without language prefix: /servizi-hotel/reception -> /submenu/servizi-hotel
          const parent = pathSegments[0];
          console.log(`Navigating back to submenu: /submenu/${parent}`);
          navigate(`/submenu/${parent}`);
          return;
        }
      }
      
      // Handle submenu content pages
      if (isInSubmenuContentPage && location.state?.parentPath) {
        console.log("Navigating back to submenu from content page:", location.state.parentPath);
        
        // Extract the path part after /submenu/
        const parentPath = location.state.parentPath;
        const segments = parentPath.split('/').filter(Boolean);
        
        if (segments.length >= 1) {
          // Check if first segment is a language code
          const firstSegment = segments[0];
          
          if (['en', 'fr', 'es', 'de'].includes(firstSegment) && segments.length >= 2) {
            // Language-prefixed path
            navigate(`/submenu/${firstSegment}/${segments[1]}`);
          } else {
            // Regular path
            navigate(`/submenu/${segments[0]}`);
          }
        } else {
          // Fallback to main menu in current language
          navigateToMainMenu();
        }
      } else if (isInSubmenu) {
        // If we're in a submenu, go back to menu in current language
        navigateToMainMenu();
      } else {
        // Default fallback to main menu in current language
        navigateToMainMenu();
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to menu in case of any navigation error
      navigateToMainMenu();
    }
  };
  
  const navigateToMainMenu = () => {
    console.log("Navigating to main menu in language:", language);
    if (language !== 'it') {
      navigate(`/${language}/menu`);
    } else {
      navigate("/menu");
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        <TranslatedText text="Back" />
      </Button>
      
      {onNavigateForward && (
        <Button
          variant="ghost"
          className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
          onClick={onNavigateForward}
          disabled={!canNavigateForward}
        >
          <TranslatedText text="Forward" />
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigateBack;
