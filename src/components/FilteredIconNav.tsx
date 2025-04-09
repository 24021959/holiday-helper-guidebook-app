
import React, { useEffect } from "react";
import IconNav from "./IconNav";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useMenuIcons } from "@/hooks/useMenuIcons";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";

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

  useEffect(() => {
    console.log("FilteredIconNav - Render with icons:", allIcons.length, "parentPath:", parentPath);
    console.log("FilteredIconNav - Current language:", language);
    
    if (allIcons.length === 0) {
      console.log("FilteredIconNav - No icons found for parentPath:", parentPath, "and language:", language);
    } else {
      console.log("FilteredIconNav - First icon:", JSON.stringify(allIcons[0]));
      if (parentPath) {
        console.log("FilteredIconNav - Showing subpages for:", parentPath);
      }
    }
  }, [allIcons, parentPath, language]);

  // Filter icons based on current language
  const icons = React.useMemo(() => {
    if (language === 'it') {
      // For Italian (default), show only paths that don't start with prefixes of other languages
      return allIcons.filter(icon => {
        const path = icon.path || '';
        return !path.startsWith('/en/') && 
               !path.startsWith('/fr/') && 
               !path.startsWith('/es/') && 
               !path.startsWith('/de/');
      });
    } else {
      // For other languages, show only paths that start with the current language prefix
      return allIcons.filter(icon => {
        const path = icon.path || '';
        return path.startsWith(`/${language}`);
      });
    }
  }, [allIcons, language]);

  useEffect(() => {
    console.log("FilteredIconNav - All icons before filtering:", allIcons.length);
    console.log("FilteredIconNav - Icons after filtering:", icons.length);
  }, [allIcons, icons]);

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
