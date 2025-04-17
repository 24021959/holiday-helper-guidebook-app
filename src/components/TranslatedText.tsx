
import React from "react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  dangerouslySetInnerHTML?: boolean;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  as: Component = "span", 
  className = "",
  dangerouslySetInnerHTML = false
}) => {
  // Semplice componente che renderizza il testo senza traduzione
  if (dangerouslySetInnerHTML) {
    return (
      <Component 
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <Component className={className}>
      {text}
    </Component>
  );
};

TranslatedText.displayName = "TranslatedText";

export default TranslatedText;
