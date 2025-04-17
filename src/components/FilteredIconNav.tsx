
import React, { useState } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useMenuIcons } from "@/hooks/menu/useMenuIcons";
import { toast } from "sonner";
import EmptyMenuState from "./menu/EmptyMenuState";
import AdminHelpBox from "./menu/AdminHelpBox";
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
  const { icons, isLoading, error, refreshIcons } = useMenuIcons({ 
    parentPath, 
    refreshTrigger 
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRefresh = () => {
    setLocalError(null);
    if (onRefresh) {
      onRefresh();
    } else {
      refreshIcons();
      toast.info("Aggiornamento menu...");
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
