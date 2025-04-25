
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-4">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <p className="text-red-600">{error}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="mt-4"
          >
            Riprova
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
