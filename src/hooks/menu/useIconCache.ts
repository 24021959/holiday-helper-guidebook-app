
import { useState, useCallback } from "react";
import { IconData } from "./types";

interface IconCache {
  [key: string]: {
    data: IconData[];
    timestamp: number;
    expiresAt: number;
  }
}

/**
 * Hook per la gestione della cache delle icone del menu
 */
export const useIconCache = () => {
  // Utilizziamo una variabile di modulo per la persistenza tra render
  const [cache] = useState<IconCache>({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minuti
  
  /**
   * Salva le icone in cache
   */
  const cacheIcons = useCallback((key: string, icons: IconData[]) => {
    const now = Date.now();
    cache[key] = {
      data: icons,
      timestamp: now,
      expiresAt: now + CACHE_TTL
    };
    console.log(`[Cache] Saved ${icons.length} icons with key: ${key}`);
    return true;
  }, [cache]);
  
  /**
   * Ottiene le icone dalla cache se presenti e non scadute
   */
  const getCachedIcons = useCallback((key: string): IconData[] | null => {
    const entry = cache[key];
    
    if (!entry) {
      console.log(`[Cache] Miss for key: ${key}`);
      return null;
    }
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      console.log(`[Cache] Expired for key: ${key}`);
      delete cache[key];
      return null;
    }
    
    console.log(`[Cache] Hit for key: ${key}, ${entry.data.length} icons`);
    return entry.data;
  }, [cache]);
  
  /**
   * Invalida tutta la cache o una chiave specifica
   */
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      console.log(`[Cache] Invalidating key: ${key}`);
      delete cache[key];
    } else {
      console.log('[Cache] Invalidating all cache');
      Object.keys(cache).forEach(k => delete cache[k]);
    }
  }, [cache]);

  return {
    cacheIcons,
    getCachedIcons,
    invalidateCache
  };
};
