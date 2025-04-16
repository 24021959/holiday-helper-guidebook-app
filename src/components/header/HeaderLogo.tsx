
import React from 'react';

interface HeaderLogoProps {
  logoUrl: string | null;
  logoSize: "small" | "medium" | "large";
  className?: string;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({ logoUrl, logoSize, className = '' }) => {
  const logoSizeClass = {
    small: "h-12 md:h-14",
    medium: "h-16 md:h-20",
    large: "h-20 md:h-24"
  }[logoSize];

  if (!logoUrl) return null;

  return (
    <div className={`flex-shrink-0 mb-2 sm:mb-0 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Logo" 
        className={`${logoSizeClass} object-contain`} 
      />
    </div>
  );
};

export default HeaderLogo;
