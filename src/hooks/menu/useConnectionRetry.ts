
import { useState, useEffect, useCallback } from "react";

/**
 * Hook per gestire tentativi di riconnessione in caso di errori di rete
 */
export const useConnectionRetry = (
  loadFunction: () => Promise<void>,
  maxRetries = 3,
  initialDelay = 2000
) => {
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      const nextRetry = initialDelay * Math.pow(2, retryCount);
      console.log(`[Retry] Tentativo #${retryCount + 1} tra ${nextRetry}ms`);
      
      const timeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadFunction().catch(() => {
          // Se fallisce ancora, lascia che il ciclo di retry continui
        });
      }, nextRetry);
      
      setRetryTimeout(timeout);
    } else {
      console.log(`[Retry] Tentativi massimi raggiunti (${maxRetries})`);
      setHasConnectionError(true);
    }
  }, [retryCount, maxRetries, initialDelay, loadFunction]);
  
  // Effetto per iniziare il ritentativo quando retryCount cambia
  useEffect(() => {
    if (hasConnectionError && retryCount > 0 && retryCount < maxRetries) {
      retry();
    }
    
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [hasConnectionError, retryCount, retry, retryTimeout, maxRetries]);
  
  return {
    hasConnectionError,
    setHasConnectionError,
    retryCount,
    setRetryCount
  };
};
