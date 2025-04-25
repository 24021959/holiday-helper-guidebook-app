
import React from "react";

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  disableAutoTranslation?: boolean;
  dangerouslySetInnerHTML?: boolean;
  translations?: {
    [key: string]: string;
  };
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  as: Component = "span", 
  className = "",
  disableAutoTranslation = false,
  dangerouslySetInnerHTML = false,
  translations
}) => {
  if (dangerouslySetInnerHTML) {
    return (
      <Component 
        className={className} 
        data-no-translation={disableAutoTranslation}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <Component 
      className={className} 
      data-no-translation={disableAutoTranslation}
      data-translations={translations ? JSON.stringify(translations) : undefined}
    >
      {text}
    </Component>
  );
};

export default TranslatedText;
