
// Simple mock for next-intl
export const useTranslations = () => {
  return (key: string) => {
    // Return the key itself as a fallback
    return key;
  };
};
