
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface TranslationButtonProps {
  isTranslating: boolean;
  onTranslate: () => void;
  isVisible: boolean;
}

export const TranslationButton: React.FC<TranslationButtonProps> = ({
  isTranslating,
  onTranslate,
  isVisible
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="mt-6 flex justify-center">
      <Button
        onClick={onTranslate}
        disabled={isTranslating}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Globe className="w-4 h-4 mr-2" />
        {isTranslating ? "Traduzione in corso..." : "Traduci la pagina"}
      </Button>
    </div>
  );
};
