
import React, { useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showLoadingState?: boolean;
  disableAutoTranslation?: boolean; // Parametro per disattivare la traduzione automatica
}

// Usa memo per prevenire re-render non necessari
const TranslatedText: React.FC<TranslatedTextProps> = memo(({ 
  text, 
  as: Component = "span", 
  className = "",
  showLoadingState = true,
  disableAutoTranslation = false // Default a false per retrocompatibilità
}) => {
  const { language, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const prevTextRef = useRef(text);
  const prevLanguageRef = useRef(language);
  
  // Cache di traduzione in memoria del componente
  const translationCacheRef = useRef<Record<string, string>>({});
  const cacheKey = `${language}:${text}`;

  useEffect(() => {
    // Se la traduzione automatica è disattivata, usa solo il testo originale
    if (disableAutoTranslation) {
      setTranslatedText(text);
      return;
    }

    // Controlla se è necessaria una nuova traduzione
    const needsTranslation = 
      language !== 'it' && 
      (text !== prevTextRef.current || 
       language !== prevLanguageRef.current);
    
    let isMounted = true;
    
    const fetchTranslation = async () => {
      // Se siamo in italiano o la traduzione è già in cache, usala direttamente
      if (language === 'it') {
        setTranslatedText(text);
        return;
      }
      
      // Controlla se la traduzione è in cache
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
          // Salva in cache
          translationCacheRef.current[cacheKey] = result;
        }
      } catch (error) {
        console.error("Errore di traduzione:", error);
        if (isMounted) {
          setTranslatedText(text); // Fallback al testo originale in caso di errore
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
      // Usa sempre il testo originale per l'italiano
      setTranslatedText(text);
    }
    
    // Aggiorna i riferimenti per il prossimo render
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
