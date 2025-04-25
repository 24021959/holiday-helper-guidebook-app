
import React, { useEffect } from "react";
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
  
  const currentPath = useCurrentPath();
  
  useEffect(() => {
    console.log("FilteredIconNav - Current path:", currentPath);
    console.log("FilteredIconNav - Parent path:", parentPath);
    console.log("FilteredIconNav - Icons loaded:", icons.length);
  }, [currentPath, parentPath, icons.length]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshIcons} />;
  }
  
  if (isLoading && icons.length === 0) {
    return <LoadingIndicator />;
  }
  
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
