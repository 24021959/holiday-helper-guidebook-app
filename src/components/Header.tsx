
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
      
      {/* Contenuto principale */}
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wider mb-2 drop-shadow-md">
          WELCOME
        </h1>
        <div className="h-1 w-24 bg-white mx-auto my-3 rounded-full"></div>
        <p className="text-xl text-white font-light tracking-wide">
          Il tuo compagno di viaggio digitale
        </p>
      </div>
    </div>
  );
};

export default Header;
