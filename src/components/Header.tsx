
import React from "react";
import AdminButton from "./AdminButton";

interface HeaderProps {
  backgroundImage?: string;
  showAdminButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ backgroundImage, showAdminButton = true }) => {
  return (
    <div
      className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 py-12 px-4 text-center shadow-lg relative overflow-hidden"
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
      
      {/* Elementi decorativi */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white"></div>
      </div>
      
      {/* Welcome text */}
      <div className="relative z-10 flex justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Welcome</h1>
      </div>
    </div>
  );
};

export default Header;
