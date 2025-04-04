
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/context/TranslationContext";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  as: Component = "span", 
  className = "" 
}) => {
  const { language, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTranslation = async () => {
      if (language === 'it') {
        setTranslatedText(text);
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await translate(text);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error("Translation error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchTranslation();
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate]);

  return (
    <Component className={className}>
      {isLoading ? (
        <span className="opacity-70">{text}</span>
      ) : (
        translatedText
      )}
    </Component>
  );
};

export default TranslatedText;
