
import React from "react";

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
  return (
    <Component className={className}>
      {text}
    </Component>
  );
};

export default TranslatedText;
