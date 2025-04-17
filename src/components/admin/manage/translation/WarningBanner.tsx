
import React from 'react';
import { AlertTriangle } from "lucide-react";

export const WarningBanner = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
        <div className="text-amber-800 text-sm">
          <p className="font-medium mb-1">Importante:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Questo processo tradurrà e clomerà <strong>tutte</strong> le pagine in italiano nei menu delle rispettive lingue</li>
            <li>La procedura potrebbe richiedere diversi minuti a seconda del numero di pagine</li>
            <li>Ogni lingua viene elaborata separatamente: esegui una traduzione alla volta</li>
            <li>Le pagine già tradotte verranno aggiornate con l'ultima versione in italiano</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
