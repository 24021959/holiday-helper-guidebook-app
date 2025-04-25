
import { useState, useEffect, useCallback } from "react";

export const useConnectionRetry = (onRetry: () => void) => {
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (hasConnectionError && retryCount < 3) {
      const retryTime = 3000 * (retryCount + 1);
      console.log(`Will retry connection in ${retryTime/1000}s (attempt ${retryCount + 1})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        onRetry();
      }, retryTime);
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionError, retryCount, onRetry]);

  return {
    hasConnectionError,
    setHasConnectionError,
    retryCount,
    setRetryCount
  };
};
