
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface IndexCleanupBannerProps {
  onCleanup: () => void;
}

export const IndexCleanupBanner: React.FC<IndexCleanupBannerProps> = ({
  onCleanup
}) => {
  return (
    <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-800">Rilevate due pagine home</h3>
          <p className="text-amber-700 text-sm mt-1">
            Sono state rilevate sia una pagina Index (/) che una pagina Home (/home). 
            Si consiglia di rimuovere la vecchia pagina Index per evitare confusione.
          </p>
          <Button 
            variant="outline" 
            className="mt-3 bg-white text-amber-700 border-amber-300 hover:bg-amber-100"
            onClick={onCleanup}
          >
            <Trash2 className="h-4 w-4 mr-2" /> 
            Elimina pagina Index (/)
          </Button>
        </div>
      </div>
    </div>
  );
};
