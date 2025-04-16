
import React from 'react';

interface EstablishmentNameProps {
  name: string;
  alignment: "left" | "center" | "right";
  color: string;
  className?: string;
}

const EstablishmentName: React.FC<EstablishmentNameProps> = ({ 
  name, 
  alignment, 
  color,
  className = ''
}) => {
  const getTextAlignmentClass = () => {
    switch (alignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  if (!name) return null;

  return (
    <div className={`w-full ${className}`}>
      <h1 
        className={`text-xl md:text-2xl font-bold ${getTextAlignmentClass()}`}
        style={{ color: color || '#000000' }}
      >
        {name}
      </h1>
    </div>
  );
};

export default EstablishmentName;
