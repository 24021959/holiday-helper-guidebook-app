
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
    console.log("FilteredIconNav - Render with icons:", icons.length, "parentPath:", parentPath);
    console.log("FilteredIconNav - Icons data:", JSON.stringify(icons));
    
    if (icons.length === 0) {
      console.log("FilteredIconNav - No icons found for parentPath:", parentPath);
    } else {
      console.log("FilteredIconNav - First icon:", JSON.stringify(icons[0]));
      if (parentPath) {
        console.log("FilteredIconNav - Showing subpages for:", parentPath);
        icons.forEach(icon => {
          console.log(`- Subpage: ${icon.title} (${icon.path}), parent: ${icon.parent_path}`);
        });
      }
    }
  }, [icons, parentPath]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshIcons();
      toast.info("Refreshing menu...");
    }
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

  return (
    <IconNav 
      icons={icons}
      parentPath={parentPath} 
      onRefresh={handleRefresh}
    />
  );
};

export default FilteredIconNav;
