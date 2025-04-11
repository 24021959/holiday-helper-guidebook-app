
import React from "react";

interface HeaderProps {
  backgroundImage?: string;
  backgroundColor?: string;
  logoUrl?: string;
  logoSize?: "small" | "medium" | "large";
  logoPosition?: "left" | "center" | "right";
  establishmentName?: string;
  showAdminButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  backgroundImage, 
  backgroundColor = "bg-white",
  logoUrl,
  logoSize = "medium",
  logoPosition = "left",
  establishmentName,
  showAdminButton = false
}) => {
  // Determine if we should use dark or light text based on background color
  const isLightBackground = 
    backgroundColor === "bg-white" || 
    backgroundColor === "bg-gradient-to-r from-amber-400 to-yellow-500";
  
  const textColorClass = isLightBackground ? "text-gray-800" : "text-white";

  // Calculate logo size
  const logoSizeClass = {
    small: "h-12 md:h-14",
    medium: "h-16 md:h-20",
    large: "h-20 md:h-24"
  }[logoSize];

  // Determine layout based on logo position
  const layoutClass = {
    left: "sm:flex-row sm:justify-between",
    center: "flex-col items-center",
    right: "sm:flex-row-reverse sm:justify-between"
  }[logoPosition];

  // Additional margin for centered layout (logo above, name below)
  const nameMarginClass = logoPosition === "center" && logoUrl ? "mt-2" : "mt-0";

  return (
    <div
      className={`w-full ${!backgroundImage ? backgroundColor : ''} py-5 px-4 shadow-md relative overflow-hidden rounded-xl`}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      {/* Decorative elements (only for colored headers, not for white background) */}
      {backgroundColor !== "bg-white" && (
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white"></div>
          <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white"></div>
        </div>
      )}
      
      {/* Logo and Title - responsive layout */}
      <div className={`relative z-10 flex ${layoutClass}`}>
        {/* Logo - only show if provided */}
        {logoUrl && (
          <div className="flex-shrink-0 mb-2 sm:mb-0">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className={`${logoSizeClass} object-contain`} 
            />
          </div>
        )}
        
        {/* Title - only show if provided */}
        {establishmentName && (
          <div className={nameMarginClass}>
            <h1 className={`text-xl md:text-2xl font-bold ${textColorClass}`}>{establishmentName}</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
