
import React from "react";
import { RefreshCw } from "lucide-react";
import TranslatedText from "./TranslatedText";

interface ErrorViewProps {
  message: string;
  onRefresh: () => void;
  onAlternativeAction?: () => void;
  alternativeActionText?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({ 
  message, 
  onRefresh, 
  onAlternativeAction, 
  alternativeActionText 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
        <p className="text-red-500 mb-4">
          <TranslatedText text={message} />
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <TranslatedText text="Riprova" />
          </button>
          
          {onAlternativeAction && alternativeActionText && (
            <button 
              onClick={onAlternativeAction}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <TranslatedText text={alternativeActionText} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorView;
