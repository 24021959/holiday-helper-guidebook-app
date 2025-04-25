
import { useLocation } from 'react-router-dom';

export const useCurrentPath = () => {
  const location = useLocation();
  return location.pathname;
};

export const useCurrentLanguagePath = () => {
  const path = useCurrentPath();
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

export const usePathWithoutLanguage = () => {
  const path = useCurrentPath();
  // Strip language prefix if present
  return path.replace(/^\/[a-z]{2}\//, '/');
};
