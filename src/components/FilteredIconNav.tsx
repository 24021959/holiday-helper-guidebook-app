
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

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md bg-amber-50 border border-amber-200 rounded-lg p-6 shadow">
          <h2 className="text-xl text-amber-700 font-medium mb-3">Empty Menu</h2>
          <p className="text-amber-600 mb-4">
            No published pages found for this menu. Follow the instructions below to add pages.
          </p>
          
          <div className="bg-white border border-amber-200 rounded-lg p-4 text-left">
            <p className="text-amber-700 mb-2 font-medium">
              To add pages to this menu:
            </p>
            <ol className="text-sm text-amber-600 list-decimal pl-5 space-y-2">
              <li>
                Go to the admin area (/admin)
              </li>
              <li>
                Use the 'Create New Page' function
              </li>
              <li>
                Set 'Published' to ON for the created page
              </li>
              <li>
                Make sure the 'parent_path' field is correctly set to: <span className="font-mono bg-amber-100 px-1 rounded">{parentPath || "empty (for main pages)"}</span>
              </li>
            </ol>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
          >
            Check Again
          </button>
        </div>
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
