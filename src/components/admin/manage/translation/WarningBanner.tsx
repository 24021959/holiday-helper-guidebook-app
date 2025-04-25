
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const WarningBanner: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Attenzione</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p>
          La traduzione automatica può richiedere tempo e potrebbe non essere perfetta. Si consiglia di:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Non chiudere questa pagina durante la traduzione</li>
          <li>Verificare manualmente le traduzioni generate</li>
          <li>Modificare il contenuto tradotto se necessario</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};
