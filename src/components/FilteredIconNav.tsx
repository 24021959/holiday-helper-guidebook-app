
import React, { useEffect } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useMenuIcons } from "@/hooks/useMenuIcons";
import { toast } from "sonner";

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

  useEffect(() => {
    console.log("FilteredIconNav - Render con icons:", icons.length, "parentPath:", parentPath);
    console.log("FilteredIconNav - Icons data:", JSON.stringify(icons));
  }, [icons, parentPath]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshIcons();
      toast.info("Aggiornamento menu in corso...");
    }
  };

  if (isLoading) {
    return <LoadingView message="Caricamento menu..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRefresh={handleRefresh}
      />
    );
  }

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md bg-amber-50 border border-amber-200 rounded-lg p-6 shadow">
          <h2 className="text-xl text-amber-700 font-medium mb-3">Menu vuoto</h2>
          <p className="text-amber-600 mb-4">
            Non sono state trovate pagine pubblicate per questo menu. Segui le istruzioni sotto per aggiungere pagine.
          </p>
          
          <div className="bg-white border border-amber-200 rounded-lg p-4 text-left">
            <p className="text-amber-700 mb-2 font-medium">
              Per aggiungere pagine al menu:
            </p>
            <ol className="text-sm text-amber-600 list-decimal pl-5 space-y-2">
              <li>
                Vai all'area amministrativa (/admin)
              </li>
              <li>
                Usa la funzione 'Crea Nuova Pagina'
              </li>
              <li>
                Imposta 'Pubblicato' su ON per la pagina creata
              </li>
              <li>
                Assicurati che il campo 'parent_path' sia corretto: vuoto per pagine principali, o il percorso del genitore per sottopagine
              </li>
            </ol>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
          >
            Controlla di nuovo
          </button>
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
