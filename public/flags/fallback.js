
// If the flag images are not uploaded correctly, we can use emoji flags
// Replace the img tags with spans containing the flag emoji

export const getFallbackFlag = (code) => {
  const flagMap = {
    it: "🇮🇹",
    en: "🇬🇧",
    fr: "🇫🇷",
    es: "🇪🇸",
    de: "🇩🇪"
  };
  
  return flagMap[code] || "🏳️";
};
