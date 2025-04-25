
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
  const isHomePage = currentPath === '/home' || currentPath === '/' || currentPath.endsWith('/home');
  
  useEffect(() => {
    console.log("[FilteredIconNav] Current path:", currentPath);
    console.log("[FilteredIconNav] Is home page:", isHomePage);
    console.log("[FilteredIconNav] Parent path:", parentPath);
    console.log("[FilteredIconNav] Icons to display:", icons);
  }, [currentPath, parentPath, icons.length, isHomePage]);

  // Filter out subpages on homepage
  const filteredIcons = isHomePage 
    ? icons.filter(icon => !icon.path.includes('/pizzerias') && 
                          !icon.path.includes('/traditional') && 
                          !icon.path.includes('/restaurants') &&
                          !icon.parent_path)
    : icons;

  // Show error only if no icons
  if (error && filteredIcons.length === 0) {
    return <ErrorDisplay error={error} onRetry={refreshIcons} />;
  }
  
  // Show loading only if no icons yet
  if (isLoading && filteredIcons.length === 0) {
    return <LoadingIndicator />;
  }
  
  return (
    <div className="flex-1">
      <IconNav 
        parentPath={parentPath} 
        icons={filteredIcons}
        onRefresh={refreshIcons} 
      />
    </div>
  );
};

export default FilteredIconNav;
