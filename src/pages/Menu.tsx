
import React, { useEffect, useState } from "react";
import IconNav from "@/components/IconNav";
import AdminButton from "@/components/AdminButton";
import Header from "@/components/Header";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
}

const Menu: React.FC = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  
  useEffect(() => {
    const savedHeaderSettings = localStorage.getItem("headerSettings");
    if (savedHeaderSettings) {
      try {
        setHeaderSettings(JSON.parse(savedHeaderSettings));
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
      }
    }
  }, []);
  
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
      {/* Header con le impostazioni personalizzate */}
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        showAdminButton={true}
      />
      
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
