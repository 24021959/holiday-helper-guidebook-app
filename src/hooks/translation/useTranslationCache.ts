
import { useState, useEffect } from 'react';
import { TranslationCache } from '@/types/translation.types';

export const useTranslationCache = () => {
  const [cache, setCache] = useState<TranslationCache>(() => {
    const savedCache = localStorage.getItem('translationCache');
    if (savedCache) {
      try {
        return JSON.parse(savedCache);
      } catch (e) {
        console.error('Error parsing translation cache:', e);
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    const saveCache = () => {
      try {
        localStorage.setItem('translationCache', JSON.stringify(cache));
      } catch (e) {
        console.error('Error saving translation cache:', e);
        // If storage is full, clear cache
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.log('Storage quota exceeded, clearing cache');
          setCache({});
          localStorage.removeItem('translationCache');
        }
      }
    };

    // Debounce saving to localStorage
    const timeoutId = setTimeout(saveCache, 1000);
    return () => clearTimeout(timeoutId);
  }, [cache]);

  const getCached = (lang: string, text: string): string | undefined => {
    return cache[lang]?.[text];
  };

  const setCached = (lang: string, text: string, translation: string): void => {
    setCache(prevCache => {
      // Create a new object to ensure state update
      const newCache = { ...prevCache };
      
      // Initialize language object if needed
      if (!newCache[lang]) {
        newCache[lang] = {};
      }
      
      // Add translation
      newCache[lang][text] = translation;
      
      return newCache;
    });
  };

  const clearCache = (): void => {
    setCache({});
    localStorage.removeItem('translationCache');
  };

  return {
    cache,
    getCached,
    setCached,
    clearCache
  };
};
