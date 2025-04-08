
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2 } from "lucide-react";

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
        if (isMounted) {
          setTranslatedText(text); // Fallback to original text on error
        }
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
        <span className="inline-flex items-center gap-1 opacity-70">
          <Loader2 size={14} className="animate-spin" />
          <span>{text}</span>
        </span>
      ) : (
        translatedText
      )}
    </Component>
  );
};

export default TranslatedText;
