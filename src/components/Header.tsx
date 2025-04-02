
import React from "react";

interface HeaderProps {
  backgroundImage?: string;
}

const Header: React.FC<HeaderProps> = ({ backgroundImage }) => {
  return (
    <div
      className="w-full bg-gradient-to-r from-teal-200 to-emerald-300 py-8 px-4 text-center"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-wider">
        WELCOME BOOK
      </h1>
    </div>
  );
};

export default Header;
