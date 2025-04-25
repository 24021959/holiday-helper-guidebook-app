
import React, { useEffect } from "react";
import IconNav from "./IconNav";
import { useMenuIcons } from "@/hooks/menu/useMenuIcons";
import LoadingIndicator from "./LoadingIndicator";
import ErrorDisplay from "./ErrorDisplay";
import { useCurrentPath, useCurrentLanguagePath } from "@/hooks/useCurrentPath";

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
  const currentLanguage = useCurrentLanguagePath();
  const isHomePage = currentPath === '/home' || currentPath === '/' || 
    currentPath.endsWith('/home') || currentPath.match(/^\/[a-z]{2}\/home$/);
  
  useEffect(() => {
    console.log("[FilteredIconNav] Current path:", currentPath);
    console.log("[FilteredIconNav] Current language:", currentLanguage);
    console.log("[FilteredIconNav] Is home page:", isHomePage);
    console.log("[FilteredIconNav] Parent path:", parentPath);
    console.log("[FilteredIconNav] Raw icons:", icons);
  }, [currentPath, parentPath, icons, isHomePage, currentLanguage]);

  // Filter out subpages on homepage - only show root level items
  const filteredIcons = isHomePage 
    ? icons.filter(icon => !icon.parent_path)
    : icons;

  useEffect(() => {
    console.log("[FilteredIconNav] Filtered icons to display:", filteredIcons);
  }, [filteredIcons]);

  if (error && filteredIcons.length === 0) {
    return <ErrorDisplay error={error} onRetry={refreshIcons} />;
  }
  
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
