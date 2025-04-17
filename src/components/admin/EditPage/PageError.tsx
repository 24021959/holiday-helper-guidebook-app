
import React from 'react';
import { Button } from "@/components/ui/button";

interface PageErrorProps {
  handleBackClick: () => void;
}

export const PageError: React.FC<PageErrorProps> = ({ handleBackClick }) => {
  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-300 p-4 rounded-md">
        <h2 className="text-red-600 font-medium text-lg">Errore</h2>
        <p className="text-red-500">Nessuna pagina selezionata per la modifica</p>
        <Button
          className="mt-4 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleBackClick}
        >
          Torna alla gestione pagine
        </Button>
      </div>
    </div>
  );
};
