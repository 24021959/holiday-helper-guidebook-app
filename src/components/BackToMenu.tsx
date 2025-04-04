
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackToMenu = () => {
  return (
    <div className="w-full bg-white py-2 px-4 shadow-sm">
      <Link 
        to="/menu" 
        className="flex items-center gap-2 text-emerald-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Menu</span>
      </Link>
    </div>
  );
};

export default BackToMenu;
