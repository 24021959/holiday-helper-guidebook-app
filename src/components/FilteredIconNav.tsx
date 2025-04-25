
import React, { useState, useEffect } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useMenuIcons } from "@/hooks/menu/useMenuIcons";
import { toast } from "sonner";
import EmptyMenuState from "./menu/EmptyMenuState";
import AdminHelpBox from "./menu/AdminHelpBox";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";
import { useNavigate } from "react-router-dom";

interface FilteredIconNavProps {
  parentPath: string | null;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const FilteredIconNav: React.FC<FilteredIconNavProps> = ({ 
  parentPath, 
  onRefresh, 
  refreshTrigger = 0 
}) => {
  const { icons, isLoading, error, refreshIcons } = useMenuIcons({ 
    parentPath, 
    refreshTrigger 
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  // Auto-retry on network error
  useEffect(() => {
    if (error && error.includes("fetch") && retryAttempts < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retry attempt ${retryAttempts + 1}`);
        setRetryAttempts(prev => prev + 1);
        handleRefresh();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryAttempts]);

  const handleRefresh = () => {
    setLocalError(null);
    if (onRefresh) {
      onRefresh();
    } else {
      refreshIcons();
      toast.info("Aggiornamento menu...");
    }
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleSwitchToItalian = () => {
    if (language !== 'it') {
      setLanguage('it');
      toast.info("Lingua cambiata in italiano");
      setTimeout(handleRefresh, 500);
    }
  };

  if (isLoading) {
    return <LoadingView message="Caricamento menu..." />;
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Problema di connessione
        </h3>
        <p className="text-gray-600 mb-6 max-w-md text-center">
          Non è stato possibile caricare il menu. Potrebbe esserci un problema di connessione al database.
        </p>
        
        <div className="flex flex-col md:flex-row gap-3">
          <Button onClick={handleRefresh} variant="default">
            Riprova
          </Button>
          <Button onClick={handleGoHome} variant="outline">
            Torna alla Home
          </Button>
          {language !== 'it' && (
            <Button onClick={handleSwitchToItalian} variant="secondary">
              Passa al menu italiano
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!icons || icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Menu vuoto</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Non ci sono pagine disponibili in questa sezione del menu
        </p>
        
        <AdminHelpBox />
        
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <Button onClick={handleRefresh}>
            Aggiorna menu
          </Button>
          <Button onClick={handleGoHome} variant="outline">
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <IconNav 
      icons={icons}
      parentPath={parentPath} 
      onRefresh={handleRefresh}
    />
  );
};

export default FilteredIconNav;
