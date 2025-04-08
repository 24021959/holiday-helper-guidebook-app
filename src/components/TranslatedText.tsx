
import React, { useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

// Utilizziamo memo per evitare rendering inutili
const TranslatedText: React.FC<TranslatedTextProps> = memo(({ 
  text, 
  as: Component = "span", 
  className = "" 
}) => {
  const { language, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const prevTextRef = useRef(text);
  const prevLanguageRef = useRef(language);
  
  // Cache delle traduzioni in memoria del componente
  const translationCacheRef = useRef<Record<string, string>>({});
  const cacheKey = `${language}:${text}`;

  useEffect(() => {
    // Verifica se è necessario eseguire una nuova traduzione
    const needsTranslation = 
      language !== 'it' && 
      (text !== prevTextRef.current || 
       language !== prevLanguageRef.current);
    
    let isMounted = true;
    
    const fetchTranslation = async () => {
      // Se siamo in italiano o la traduzione è già nella cache, la usiamo direttamente
      if (language === 'it') {
        setTranslatedText(text);
        return;
      }
      
      // Verifica se la traduzione è nella cache
      if (translationCacheRef.current[cacheKey]) {
        setTranslatedText(translationCacheRef.current[cacheKey]);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log(`Translating: "${text}" to ${language}`);
        const result = await translate(text);
        
        if (isMounted) {
          setTranslatedText(result);
          // Salva nella cache
          translationCacheRef.current[cacheKey] = result;
        }
      } catch (error) {
        console.error("Translation error:", error);
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
    }
    
    // Aggiorna i riferimenti per il prossimo render
    prevTextRef.current = text;
    prevLanguageRef.current = language;
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate, cacheKey]);

  return (
    <Component className={className}>
      {isLoading ? (
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
