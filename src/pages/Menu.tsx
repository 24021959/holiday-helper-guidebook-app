
import React from "react";
import IconNav from "@/components/IconNav";

const Menu: React.FC = () => {
  // Component for footer with logo
  const Footer = () => (
    <div className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 py-3 border-t border-gray-200">
      <div className="flex justify-center items-center">
        <img 
          src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
          alt="EVA AI Technologies Logo" 
          className="h-8 md:h-10" 
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Grande header con "Welcome Book" */}
      <div className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 py-5 text-center shadow-md">
        <h1 className="text-white font-bold text-2xl md:text-3xl tracking-wider">WELCOME BOOK</h1>
      </div>
      
      {/* Testo che invita a usare il menu */}
      <div className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 py-3 text-center border-b border-gray-100 shadow-sm">
        <p className="text-emerald-700 font-medium text-sm md:text-base italic">Seleziona un'icona dal menu per esplorare i contenuti</p>
      </div>
      
      {/* Contenitore principale con le icone che prende tutto lo spazio disponibile */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <IconNav />
      </div>
      
      {/* Footer con logo */}
      <Footer />
    </div>
  );
};

export default Menu;
