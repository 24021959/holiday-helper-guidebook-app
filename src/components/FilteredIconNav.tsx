
import React from "react";
import IconNav from "./IconNav";
import { RefreshCw } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useMenuIcons } from "@/hooks/useMenuIcons";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";

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
  const {
    icons,
    isLoading,
    error,
    refreshIcons
  } = useMenuIcons({ parentPath, refreshTrigger });

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshIcons();
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

  return (
    <IconNav 
      icons={icons}
      parentPath={parentPath} 
      onRefresh={handleRefresh} 
      refreshTrigger={refreshTrigger} 
    />
  );
};

export default FilteredIconNav;
