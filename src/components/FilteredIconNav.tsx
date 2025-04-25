
import React, { useState } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import { useMenuIcons } from "@/hooks/menu/useMenuIcons";
import { toast } from "sonner";
import EmptyMenuState from "./menu/EmptyMenuState";
import { Button } from "./ui/button";
import { AlertTriangle, Home } from "lucide-react";
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
  const { language } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingView message="Caricamento menu..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Errore di caricamento
        </h3>
        <p className="text-gray-600 mb-6">
          Non è stato possibile caricare il menu. Riprova più tardi.
        </p>
        <div className="flex gap-4">
          <Button onClick={refreshIcons}>
            Riprova
          </Button>
          <Button variant="outline" onClick={() => navigate('/home')}>
            <Home className="w-4 h-4 mr-2" />
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  if (!icons || icons.length === 0) {
    return <EmptyMenuState onRefresh={onRefresh} />;
  }

  return (
    <IconNav 
      icons={icons} 
      parentPath={parentPath}
      onRefresh={onRefresh}
    />
  );
};

export default FilteredIconNav;
