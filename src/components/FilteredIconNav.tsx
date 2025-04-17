import React, { useEffect, useState } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useMenuIcons } from "@/hooks/menu/useMenuIcons";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";
import EmptyMenuState from "./menu/EmptyMenuState";
import AdminHelpBox from "./menu/AdminHelpBox";
import { Button } from "./ui/button";
import { IconData } from "@/hooks/menu/types";

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
      // Per l'italiano, filtra solo le pagine italiane (path che non iniziano con /en/, /fr/, etc.)
      // inoltre escludi le pagine root di altre lingue come /en, /fr, etc.
      return allIcons.filter(icon => {
        const path = icon.path || '';
        // Escludiamo sia i percorsi /lingua/ che /lingua
        return !path.match(/^\/(en|fr|es|de)(\/|$)/);
      });
    } else {
      // Per altre lingue, mostra solo percorsi con il prefisso della lingua corrente
      // più specificamente, solo quelli che iniziano con /lingua/ o sono esattamente /lingua
      return allIcons.filter(icon => {
        const path = icon.path || '';
        return path === `/${language}` || path.startsWith(`/${language}/`);
      });
    }
  }, [allIcons, language]);

  useEffect(() => {
    console.log("FilteredIconNav - All icons before filtering:", allIcons.length);
    console.log("FilteredIconNav - Icons after filtering:", icons.length);
    
    if (icons.length > 0) {
      console.log("FilteredIconNav - Filtered icon paths:", icons.map(i => i.path).join(', '));
    }
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
      <EmptyMenuState
        message={localError}
        onRefresh={handleRefresh}
        onSwitchToItalian={handleSwitchToItalian}
        showItalianSwitch={language !== 'it'}
      />
    );
  }

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Menu vuoto</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Non ci sono pagine disponibili in questa sezione del menu
        </p>
        
        <AdminHelpBox />
        
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
