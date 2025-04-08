
import React from "react";
import { Loader2 } from "lucide-react";
import TranslatedText from "./TranslatedText";

interface LoadingViewProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingView: React.FC<LoadingViewProps> = ({ 
  message = "Caricamento...", 
  fullScreen = false 
}) => {
  const content = (
    <>
      <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
      <p className="mt-4 text-emerald-700">
        <TranslatedText text={message} />
      </p>
    </>
  );

  if (fullScreen) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        {content}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {content}
    </div>
  );
};

export default LoadingView;
