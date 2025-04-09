
import React, { useEffect, useState } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useMenuIcons } from "@/hooks/useMenuIcons";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

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
  const { language } = useTranslation();
  const { icons: allIcons, isLoading, error, refreshIcons } = useMenuIcons({ 
    parentPath, 
    refreshTrigger 
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    console.log("FilteredIconNav - Render with icons:", allIcons.length, "parentPath:", parentPath);
    console.log("FilteredIconNav - Current language:", language);
    
    if (allIcons.length === 0 && !isLoading && !error) {
      console.log("FilteredIconNav - No icons found for parentPath:", parentPath, "and language:", language);
      
      if (language !== 'it') {
        setLocalError(`Nessuna pagina trovata nel menu ${language.toUpperCase()}. Prova a tradurre il menu dalla sezione amministrativa.`);
      } else {
        setLocalError(null);
      }
    } else {
      setLocalError(null);
      
      if (parentPath) {
        console.log("FilteredIconNav - Showing subpages for:", parentPath);
      }
    }
  }, [allIcons, parentPath, language, isLoading, error]);

  // Filter icons based on current language
  const icons = React.useMemo(() => {
    if (language === 'it') {
      // For Italian (default), show only paths that don't start with prefixes of other languages
      return allIcons.filter(icon => {
        const path = icon.path || '';
        return !path.startsWith('/en/') && 
               !path.startsWith('/fr/') && 
               !path.startsWith('/es/') && 
               !path.startsWith('/de/');
      });
    } else {
      // For other languages, show only paths that start with the current language prefix
      return allIcons.filter(icon => {
        const path = icon.path || '';
        return path.startsWith(`/${language}/`);
      });
    }
  }, [allIcons, language]);

  useEffect(() => {
    console.log("FilteredIconNav - All icons before filtering:", allIcons.length);
    console.log("FilteredIconNav - Icons after filtering:", icons.length);
  }, [allIcons, icons]);

  const handleRefresh = () => {
    setLocalError(null);
    if (onRefresh) {
      onRefresh();
    } else {
      refreshIcons();
      toast.info("Refreshing menu...");
    }
  };

  const handleSwitchToItalian = () => {
    window.location.href = '/menu';
  };

  if (isLoading) {
    return <LoadingView message="Loading menu..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRefresh={handleRefresh}
      />
    );
  }

  if (localError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Menu vuoto</h3>
        <p className="text-gray-600 mb-4 max-w-md">{localError}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            Aggiorna
          </Button>
          {language !== 'it' && (
            <Button onClick={handleSwitchToItalian}>
              Passa al menu italiano
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show empty state for empty menu
  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Menu vuoto</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Non ci sono pagine disponibili in questa sezione del menu
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md text-left">
          <h4 className="font-medium text-amber-800 mb-2">Come aggiungere pagine:</h4>
          <ul className="list-disc pl-5 text-amber-700 space-y-1">
            <li>Vai all'area amministrativa (/admin)</li>
            <li>Usa la funzione 'Crea Nuova Pagina'</li>
            <li>Per creare una sottopagina, seleziona il tipo 'Sottopagina'</li>
            <li>Nel dropdown genitore, seleziona la pagina genitore corretta</li>
            <li>Assicurati che il campo 'Pubblicato' sia ATTIVO</li>
          </ul>
        </div>
        
        <Button onClick={handleRefresh} className="mt-6">
          Aggiorna menu
        </Button>
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
