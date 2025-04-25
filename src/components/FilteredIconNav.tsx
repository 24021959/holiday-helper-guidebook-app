
import React, { useState, useEffect } from "react";
import IconNav from "./IconNav";
import { useMenuIcons } from "@/hooks/menu/useMenuIcons";
import LoadingIndicator from "./LoadingIndicator";
import ErrorDisplay from "./ErrorDisplay";
import { useCurrentPath } from "@/hooks/useCurrentPath";

interface FilteredIconNavProps {
  parentPath: string | null;
  refreshTrigger?: number;
}

const FilteredIconNav: React.FC<FilteredIconNavProps> = ({ 
  parentPath,
  refreshTrigger = 0
}) => {
  const { icons, isLoading, error, refreshIcons } = useMenuIcons({ 
    parentPath,
    refreshTrigger
  });
  
  // Dati debug
  const currentPath = useCurrentPath();
  
  useEffect(() => {
    console.log(`FilteredIconNav montato con parentPath: ${parentPath}`);
    
    return () => {
      console.log(`FilteredIconNav smontato con parentPath: ${parentPath}`);
    };
  }, [parentPath]);
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshIcons} />;
  }
  
  console.log(`Rendering ${icons.length} icons for path: ${parentPath || 'root'}`);
  
  return (
    <div className="flex-1">
      <IconNav 
        parentPath={parentPath} 
        icons={icons} 
        onRefresh={refreshIcons} 
      />
    </div>
  );
};

export default FilteredIconNav;
