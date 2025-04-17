
import React from "react";
import TranslatedText from "@/components/TranslatedText";
import AdminHelpBox from "./AdminHelpBox";

interface EmptyIconGridProps {
  onRefresh?: () => void;
}

const EmptyIconGrid: React.FC<EmptyIconGridProps> = ({ onRefresh }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center p-4 max-w-md">
        <p className="text-gray-600 text-lg font-medium mb-3">
          <TranslatedText text="Empty Menu" />
        </p>
        <p className="text-gray-500 mb-3">
          <TranslatedText text="There are no available pages in this section of the menu" />
        </p>
        <AdminHelpBox />
      </div>
    </div>
  );
};

export default EmptyIconGrid;
