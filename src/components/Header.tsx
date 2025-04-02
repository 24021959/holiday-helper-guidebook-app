
import React from "react";

interface HeaderProps {
  backgroundImage?: string;
}

const Header: React.FC<HeaderProps> = ({ backgroundImage }) => {
  return (
    <div
      className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 py-12 px-4 text-center shadow-lg relative overflow-hidden"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      {/* Elementi decorativi */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white"></div>
      </div>
      
      {/* Logo principale */}
      <div className="relative z-10 flex justify-center">
        <img 
          src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
          alt="EVA AI Technologies Logo" 
          className="h-16 md:h-20"
        />
      </div>
    </div>
  );
};

export default Header;
