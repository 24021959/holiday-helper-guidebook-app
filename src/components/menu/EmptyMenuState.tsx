
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";

interface EmptyMenuStateProps {
  message?: string;
  onRefresh?: () => void;
  onSwitchToItalian?: () => void;
  showItalianSwitch?: boolean;
}

const EmptyMenuState: React.FC<EmptyMenuStateProps> = ({
  message,
  onRefresh,
  onSwitchToItalian,
  showItalianSwitch
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        <TranslatedText text="Menu vuoto" />
      </h3>
      <p className="text-gray-600 mb-4 max-w-md">
        {message || (
          <TranslatedText text="Non ci sono pagine disponibili in questa sezione del menu" />
        )}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRefresh}>
          <TranslatedText text="Aggiorna" />
        </Button>
        {showItalianSwitch && (
          <Button onClick={onSwitchToItalian}>
            <TranslatedText text="Passa al menu italiano" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyMenuState;
