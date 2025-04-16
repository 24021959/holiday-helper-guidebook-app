
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
    if (window.location.pathname.includes('/admin')) {
      setTranslatedText(text);
      return;
    }

    // Verifica se siamo in un contesto di editor (qualsiasi elemento parent con attributo data-no-translation)
    const isInEditorContext = (() => {
      // Check ALL parent elements for data-no-translation attribute
      let node = document.activeElement;
      while (node) {
        if (node.getAttribute && node.getAttribute('data-no-translation') === 'true') {
          return true;
        }
        
        if (node.parentElement) {
          node = node.parentElement;
        } else if (node.parentNode) {
          node = node.parentNode as Element;
        } else {
          break;
        }
      }
      
      // Verifica anche l'esistenza di form o modali di editing
      const isInPageForm = document.querySelector('form') !== null;
      
      // Verifica se siamo in qualsiasi dialogo o modale
      const isInDialog = document.querySelector('dialog, [role="dialog"]') !== null;
      
      return isInPageForm || isInDialog;
    })();

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
