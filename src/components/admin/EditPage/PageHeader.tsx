
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  handleBackClick: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ handleBackClick }) => {
  return (
    <div className="mb-6">
      <Button
        variant="outline"
        className="mb-4"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna alla gestione pagine
      </Button>
    </div>
  );
};
