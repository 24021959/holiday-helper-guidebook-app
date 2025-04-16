
import React from "react";

interface HeaderProps {
  backgroundImage?: string;
  backgroundColor?: string;
  logoUrl?: string | null;
  logoSize?: "small" | "medium" | "large";
  logoPosition?: "left" | "center" | "right";
  establishmentName?: string | null;
  establishmentNameAlignment?: "left" | "center" | "right";
  establishmentNameColor?: string;
  showAdminButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  backgroundImage, 
  backgroundColor = "bg-white",
  logoUrl,
  logoSize = "medium",
  logoPosition = "left",
  establishmentName,
  establishmentNameAlignment = "left",
  establishmentNameColor = "#000000",
  showAdminButton = false
}) => {
  // Calculate logo size
  const logoSizeClass = {
    small: "h-12 md:h-14",
    medium: "h-16 md:h-20",
    large: "h-20 md:h-24"
  }[logoSize || "medium"];

  // Determine layout based on logo position
  const layoutClass = {
    left: "sm:flex-row sm:justify-between",
    center: "flex-col items-center",
    right: "sm:flex-row-reverse sm:justify-between"
  }[logoPosition || "left"];

  // Additional margin for centered layout (logo above, name below)
  const nameMarginClass = (logoPosition === "center" && logoUrl) ? "mt-2" : "mt-0";

  const getTextAlignmentClass = () => {
    switch (establishmentNameAlignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  return (
    <div
      className={`w-full py-5 px-4 shadow-md relative overflow-hidden rounded-xl`}
      style={{
        ...(backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: backgroundColor?.startsWith('#') ? backgroundColor : undefined })
      }}
    >
      {backgroundColor !== "bg-white" && backgroundColor !== "#FFFFFF" && !backgroundColor?.startsWith('#') && (
        <div className={`absolute inset-0 ${backgroundColor}`}></div>
      )}
      
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white"></div>
      </div>
      
      <div className={`relative z-10 flex ${layoutClass}`}>
        {logoUrl && (
          <div className="flex-shrink-0 mb-2 sm:mb-0">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className={`${logoSizeClass} object-contain`} 
            />
          </div>
        )}
        
        {establishmentName && (
          <div className={`${nameMarginClass} w-full`}>
            <h1 
              className={`text-xl md:text-2xl font-bold ${getTextAlignmentClass()}`}
              style={{ color: establishmentNameColor || '#000000' }}
            >
              {establishmentName}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
