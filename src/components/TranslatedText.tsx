
import React, { useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showLoadingState?: boolean;
  disableAutoTranslation?: boolean; // Parameter to disable automatic translation
}

// Use memo to prevent unnecessary re-renders
const TranslatedText: React.FC<TranslatedTextProps> = memo(({ 
  text, 
  as: Component = "span", 
  className = "",
  showLoadingState = true,
  disableAutoTranslation = false // Default to false for backward compatibility
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
    // Check if we're inside an editor context (parent with data-no-translation attribute)
    const isInEditorContext = !!document.querySelector('[data-no-translation="true"]')?.contains(
      document.activeElement
    );

    // If automatic translation is disabled, or we're in an editor context, use only the original text
    if (disableAutoTranslation || isInEditorContext) {
      setTranslatedText(text);
      return;
    }

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
      
      // Check if the translation is in cache
      if (translationCacheRef.current[cacheKey]) {
        setTranslatedText(translationCacheRef.current[cacheKey]);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log(`Traduzione: "${text}" in ${language}`);
        const result = await translate(text);
        
        if (isMounted) {
          console.log(`Risultato traduzione: "${result}"`);
          setTranslatedText(result);
          // Save to cache
          translationCacheRef.current[cacheKey] = result;
        }
      } catch (error) {
        console.error("Errore di traduzione:", error);
        if (isMounted) {
          setTranslatedText(text); // Fallback to original text in case of error
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
      // Always use the original text for Italian
      setTranslatedText(text);
    }
    
    // Update references for the next render
    prevTextRef.current = text;
    prevLanguageRef.current = language;
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate, cacheKey, disableAutoTranslation]);

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
