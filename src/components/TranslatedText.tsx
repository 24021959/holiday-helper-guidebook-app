
import React from "react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  disableAutoTranslation?: boolean;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  as: Component = "span", 
  className = "",
  disableAutoTranslation = false
}) => {
  return (
    <Component className={className} data-no-translation={disableAutoTranslation}>
      {text}
    </Component>
  );
};

export default TranslatedText;
