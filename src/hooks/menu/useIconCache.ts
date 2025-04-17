
import { IconData } from "./types";

export const useIconCache = () => {
  const getCachedIcons = (cacheKey: string) => {
    try {
      const cachedIconsStr = localStorage.getItem(cacheKey);
      if (cachedIconsStr) {
        return JSON.parse(cachedIconsStr);
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
    return null;
  };

  const cacheIcons = (cacheKey: string, icons: IconData[]) => {
    try {
      const iconString = JSON.stringify(icons);
      if (iconString.length < 100000) {
        localStorage.setItem(cacheKey, iconString);
      } else {
        console.warn("Icons data too large for localStorage, skipping cache");
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  };

  const clearIconCache = (cacheKey: string) => {
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.warn("Could not clear localStorage cache:", e);
    }
  };

  return {
    getCachedIcons,
    cacheIcons,
    clearIconCache
  };
};
