
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  isCreating: boolean;
  isTranslating: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  isCreating,
  isTranslating,
  onCancel,
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        onClick={onCancel}
        type="button"
      >
        Annulla
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting || isCreating || isTranslating}
      >
        {isSubmitting ? (
          "Salvataggio in corso..."
        ) : isCreating ? (
          "Creazione in corso..."
        ) : isTranslating ? (
          "Traduzione in corso..."
        ) : (
          "Crea Pagina"
        )}
      </Button>
    </div>
  );
};

