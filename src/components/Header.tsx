
import React from "react";
import AdminButton from "./AdminButton";

interface HeaderProps {
  backgroundImage?: string;
  backgroundColor?: string;
  logoUrl?: string;
  showAdminButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  backgroundImage, 
  backgroundColor = "bg-white",
  logoUrl,
  showAdminButton = true 
}) => {
  // Determina se usare testo bianco o scuro in base al colore di sfondo
  const isLightBackground = 
    backgroundColor === "bg-white" || 
    backgroundColor === "bg-gradient-to-r from-amber-400 to-yellow-500";
  
  const textColorClass = isLightBackground ? "text-gray-800" : "text-white";

  // Default logo URL
  const defaultLogo = "/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png";

  return (
    <div
      className={`w-full ${!backgroundImage ? backgroundColor : ''} py-5 px-4 shadow-md relative overflow-hidden`}
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
      
      {/* Logo and Title */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Logo a sinistra */}
        <div className="flex-shrink-0">
          <img 
            src={logoUrl || defaultLogo} 
            alt="EV-AI Logo" 
            className="h-8 md:h-10 object-contain"
          />
        </div>
        
        {/* Titolo al centro */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className={`text-xl md:text-2xl font-bold ${textColorClass}`}>EV-AI Guest</h1>
        </div>
      </div>
    </div>
  );
};

export default Header;
