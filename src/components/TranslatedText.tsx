
import React, { useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showLoadingState?: boolean;
}

// Use memo to prevent unnecessary re-renders
const TranslatedText: React.FC<TranslatedTextProps> = memo(({ 
  text, 
  as: Component = "span", 
  className = "",
  showLoadingState = true
}) => {
  const { language, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const prevTextRef = useRef(text);
  const prevLanguageRef = useRef(language);
  
  // Translation cache in component memory
  const translationCacheRef = useRef<Record<string, string>>({});
  const cacheKey = `${language}:${text}`;

  useEffect(() => {
    // Check if a new translation is needed
    const needsTranslation = 
      language !== 'it' && 
      (text !== prevTextRef.current || 
       language !== prevLanguageRef.current);
    
    let isMounted = true;
    
    const fetchTranslation = async () => {
      // If we're in Italian or the translation is already in cache, use it directly
      if (language === 'it') {
        setTranslatedText(text);
        return;
      }
      
      // Check if translation is in cache
      if (translationCacheRef.current[cacheKey]) {
        setTranslatedText(translationCacheRef.current[cacheKey]);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log(`Translating: "${text}" to ${language}`);
        const result = await translate(text);
        
        if (isMounted) {
          console.log(`Translation result: "${result}"`);
          setTranslatedText(result);
          // Save to cache
          translationCacheRef.current[cacheKey] = result;
        }
      } catch (error) {
        console.error("Translation error:", error);
        if (isMounted) {
          setTranslatedText(text); // Fallback to original text on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (needsTranslation) {
      fetchTranslation();
    } else if (language === 'it') {
      // Always set the original text for Italian
      setTranslatedText(text);
    }
    
    // Update references for next render
    prevTextRef.current = text;
    prevLanguageRef.current = language;
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate, cacheKey]);

  return (
    <Component className={className}>
      {isLoading && showLoadingState ? (
        <span className="inline-flex items-center gap-1 opacity-70">
          <Loader2 size={14} className="animate-spin" />
          <span>{text}</span>
        </span>
      ) : (
        translatedText
      )}
    </Component>
  );
});

TranslatedText.displayName = "TranslatedText";

export default TranslatedText;
