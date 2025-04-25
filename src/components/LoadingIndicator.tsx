
import { Loader2 } from "lucide-react";

const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );
};

export default LoadingIndicator;
