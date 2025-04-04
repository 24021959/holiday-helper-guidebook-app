
import React from "react";
import AdminButton from "./AdminButton";

interface HeaderProps {
  backgroundImage?: string;
  backgroundColor?: string;
  logoUrl?: string;
  logoPosition?: "center" | "left";
  showAdminButton?: boolean;
  appTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  backgroundImage, 
  backgroundColor = "bg-gradient-to-r from-teal-500 to-emerald-600",
  logoUrl,
  logoPosition = "center",
  showAdminButton = true,
  appTitle = "LOCANDA DELL'ANGELO"
}) => {
  // Determina se usare testo bianco o scuro in base al colore di sfondo
  const isLightBackground = 
    backgroundColor === "bg-white" || 
    backgroundColor === "bg-gradient-to-r from-amber-400 to-yellow-500";
  
  const textColorClass = isLightBackground ? "text-gray-800" : "text-white";

  return (
    <div
      className={`w-full ${!backgroundImage ? backgroundColor : ''} py-5 px-4 shadow-lg relative overflow-hidden`}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      {/* Admin button in the top right corner */}
      {showAdminButton && (
        <div className="absolute top-3 right-4 z-20">
          <AdminButton />
        </div>
      )}
      
      {/* Elementi decorativi (solo per header colorati, non per sfondo bianco) */}
      {backgroundColor !== "bg-white" && (
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white"></div>
          <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white"></div>
        </div>
      )}
      
      {/* Container for logo and title with flexible layout */}
      <div className="relative z-10 flex items-center">
        {/* Logo on the left when logoPosition is left */}
        {logoUrl && logoPosition === "left" && (
          <div className="flex items-center">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-10 md:h-12 object-contain"
            />
          </div>
        )}
        
        {/* Centered title */}
        <div className={`flex-1 flex justify-center ${logoPosition === "left" ? "ml-4" : ""}`}>
          <h1 className={`text-xl md:text-2xl font-bold ${textColorClass}`}>{appTitle}</h1>
        </div>
        
        {/* Logo in center when logoPosition is center */}
        {logoUrl && logoPosition === "center" && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-10 md:h-12 object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default Header;
