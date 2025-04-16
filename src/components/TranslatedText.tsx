import React, { useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";
import { Language } from "@/types/translation.types";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showLoadingState?: boolean;
  disableAutoTranslation?: boolean;
}

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
  const prevLanguageRef = useRef<Language>(language);
  
  const translationCacheRef = useRef<Record<string, string>>({});
  const cacheKey = `${language}:${text}`;

  useEffect(() => {
    // CRITICAL: Always disable translations in admin area or editor
    if (
      window.location.pathname.includes('/admin') || 
      document.body.hasAttribute('data-no-translation') ||
      disableAutoTranslation
    ) {
      setTranslatedText(text);
      return;
    }

    const inEditorMode = (() => {
      return (
        document.querySelector('[data-editor="true"]') !== null ||
        document.querySelector('form') !== null ||
        document.querySelector('textarea') !== null ||
        document.querySelector('[data-no-translation="true"]') !== null ||
        document.querySelector('dialog, [role="dialog"]') !== null
      );
    })();

    if (inEditorMode) {
      setTranslatedText(text);
      return;
    }

    const bodyHasNoTranslation = document.body.getAttribute('data-no-translation') === 'true';
    if (bodyHasNoTranslation) {
      setTranslatedText(text);
      return;
    }

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

    // Handle Italian language case
    if (language === "it" as Language) {
      setTranslatedText(text);
      return;
    }
    
    if (translationCacheRef.current[cacheKey]) {
      setTranslatedText(translationCacheRef.current[cacheKey]);
      return;
    }
    
    const needsTranslation = 
      language !== "it" as Language && 
      (text !== prevTextRef.current || 
       language !== prevLanguageRef.current);
    
    let isMounted = true;
    
    const fetchTranslation = async () => {
      if (language === "it" as Language || document.body.hasAttribute('data-no-translation')) {
        setTranslatedText(text);
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await translate(text);
        
        if (isMounted) {
          setTranslatedText(result);
          translationCacheRef.current[cacheKey] = result;
        }
      } catch (error) {
        console.error("Errore di traduzione:", error);
        if (isMounted) {
          setTranslatedText(text);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (needsTranslation) {
      fetchTranslation();
    } else if (language === "it" as Language) {
      setTranslatedText(text);
    }
    
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
