
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  isCreating: boolean;
  isTranslating: boolean;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  isCreating,
  isTranslating,
  onCancel,
  submitText,
  cancelText = "Annulla"
}) => {
  const getButtonText = () => {
    if (isSubmitting) return "Salvataggio in corso...";
    if (isCreating) return "Creazione pagina...";
    if (isTranslating) return "Traduzione in corso...";
    return submitText || "Salva Pagina";
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        onClick={onCancel}
        type="button"
      >
        {cancelText}
      </Button>
      <Button 
        type="submit"
        className="bg-emerald-600 hover:bg-emerald-700"
        disabled={isSubmitting || isCreating || isTranslating}
      >
        {(isSubmitting || isCreating || isTranslating) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {getButtonText()}
      </Button>
    </div>
  );
};
