
import React from "react";

interface AppHeaderProps {
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = "Locanda dell'Angelo" }) => {
  return (
    <header className="bg-emerald-700 shadow-md py-4 px-6 text-white">
      <div className="container mx-auto flex justify-center items-center">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      </div>
    </header>
  );
};

export default AppHeader;
