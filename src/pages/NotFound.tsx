
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";
import { useTranslation } from "@/context/TranslationContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "with state:",
      location.state
    );
  }, [location]);

  // Try to extract potential parent path from URL structure
  const getParentPathFromUrl = () => {
    const path = location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      // Check if first part is a language code
      const firstPart = pathParts[0];
      if (['it', 'en', 'fr', 'es', 'de'].includes(firstPart)) {
        // If this is a language prefixed path with at least 2 segments after language
        if (pathParts.length >= 3) {
          return `/${firstPart}/${pathParts[1]}`;
        }
      } else {
        // Non-language path with at least 2 segments
        return `/${firstPart}`;
      }
    }
    return null;
  };

  const handleBackToParent = () => {
    const parentPath = getParentPathFromUrl();
    if (parentPath) {
      console.log("Navigating to potential parent path:", parentPath);
      
      // Check if this might be a submenu parent
      const pathParts = parentPath.split('/').filter(Boolean);
      if (pathParts.length >= 1) {
        const potentialLang = pathParts[0];
        
        if (['it', 'en', 'fr', 'es', 'de'].includes(potentialLang) && pathParts.length >= 2) {
          // Language prefixed path
          navigate(`/submenu/${potentialLang}/${pathParts[1]}`);
        } else {
          // Regular path
          navigate(`/submenu/${pathParts[0]}`);
        }
      } else {
        navigate('/menu');
      }
    } else {
      // Fallback to menu
      if (language !== 'it') {
        navigate(`/${language}/menu`);
      } else {
        navigate('/menu');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">
          <TranslatedText text="Pagina non trovata" />
        </p>
        <p className="text-gray-500 mb-6">
          <TranslatedText text="La pagina richiesta non è stata trovata. Controlla l'URL o torna al menu principale." />
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => language !== 'it' ? navigate(`/${language}/menu`) : navigate('/menu')}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <TranslatedText text="Torna al Menu Principale" />
          </Button>
          
          <Button 
            onClick={handleBackToParent}
            variant="outline" 
            className="w-full"
          >
            <TranslatedText text="Torna al Menu Superiore" />
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost" 
            className="w-full"
          >
            <TranslatedText text="Torna Indietro" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
