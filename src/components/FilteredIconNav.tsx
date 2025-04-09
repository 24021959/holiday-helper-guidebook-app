
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

  // Filtra le icone in base alla lingua corrente
  const filterIconsByLanguage = (icons: any[]) => {
    if (language === 'it') {
      // Per italiano (default), mostra solo percorsi che non iniziano con i prefissi delle altre lingue
      return icons.filter(icon => {
        const path = icon.path || '';
        return !path.startsWith('/en/') && 
               !path.startsWith('/fr/') && 
               !path.startsWith('/es/') && 
               !path.startsWith('/de/');
      });
    } else {
      // Per altre lingue, mostra solo percorsi che iniziano con il prefisso della lingua corrente
      return icons.filter(icon => {
        const path = icon.path || '';
        return path.startsWith(`/${language}`);
      });
    }
  };

  const icons = filterIconsByLanguage(allIcons);

  useEffect(() => {
    console.log("FilteredIconNav - Render with icons:", icons.length, "parentPath:", parentPath);
    console.log("FilteredIconNav - Current language:", language);
    console.log("FilteredIconNav - All icons before filtering:", allIcons.length);
    console.log("FilteredIconNav - Icons after filtering:", icons.length);
    
    if (icons.length === 0) {
      console.log("FilteredIconNav - No icons found for parentPath:", parentPath, "and language:", language);
    } else {
      console.log("FilteredIconNav - First icon:", JSON.stringify(icons[0]));
      if (parentPath) {
        console.log("FilteredIconNav - Showing subpages for:", parentPath);
        icons.forEach(icon => {
          console.log(`- Subpage: ${icon.title} (${icon.path}), parent: ${icon.parent_path}`);
        });
      }
    }
  }, [icons, allIcons, parentPath, language]);

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
