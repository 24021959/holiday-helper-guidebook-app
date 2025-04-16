
import React, { useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showLoadingState?: boolean;
  disableAutoTranslation?: boolean;
}

// Use memo to prevent unnecessary re-renders
const TranslatedText: React.FC<TranslatedTextProps> = memo(({ 
  text, 
  as: Component = "span", 
  className = "",
  showLoadingState = true,
  disableAutoTranslation = false
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
    // BLOCCO CATEGORICO: In QUALSIASI contesto amministrativo o di editing,
    // NON eseguire mai traduzioni automatiche
    
    // 1. Force block any translation in admin section
    if (window.location.pathname.includes('/admin')) {
      setTranslatedText(text);
      return;
    }

    // 2. Force block any translation if disableAutoTranslation is true
    if (disableAutoTranslation) {
      setTranslatedText(text);
      return;
    }

    // 3. Check for global translation blocking attribute on body or any parent
    const bodyHasNoTranslation = document.body.getAttribute('data-no-translation') === 'true';
    if (bodyHasNoTranslation) {
      setTranslatedText(text);
      return;
    }

    // 4. Check for any parent element with data-no-translation attribute
    const isInNoTranslationContext = (() => {
      let currentElement = document.activeElement;
      while (currentElement) {
        if (currentElement.getAttribute && currentElement.getAttribute('data-no-translation') === 'true') {
          return true;
        }
        currentElement = currentElement.parentElement;
      }
      return false;
    })();

    if (isInNoTranslationContext) {
      setTranslatedText(text);
      return;
    }

    // 5. Additional check for forms, editors, or any input context
    const isInEditorContext = (() => {
      // Verifica anche l'esistenza di form o modali di editing
      const isInPageForm = document.querySelector('form') !== null;
      
      // Verifica se siamo in qualsiasi dialogo o modale
      const isInDialog = document.querySelector('dialog, [role="dialog"]') !== null;
      
      return isInPageForm || isInDialog;
    })();

    if (isInEditorContext) {
      setTranslatedText(text);
      return;
    }

    // Only proceed with translation if none of the blocking conditions are met
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
