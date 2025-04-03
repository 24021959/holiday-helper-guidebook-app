
import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  logoUrl?: string;
  backgroundColor?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  logoUrl, 
  backgroundColor = "#10b981" 
}) => {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate("/menu");
  };
  
  const headerStyle = {
    backgroundColor: backgroundColor || "#10b981"
  };

  return (
    <header 
      className="fixed top-0 left-0 w-full z-10 shadow-md py-2 px-4 flex items-center justify-between"
      style={headerStyle}
    >
      <div className="flex items-center">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-10 cursor-pointer"
            onClick={handleLogoClick}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150x50?text=Logo";
            }}
          />
        ) : (
          <div 
            className="text-white font-semibold text-lg cursor-pointer"
            onClick={handleLogoClick}
          >
            Hotel App
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
