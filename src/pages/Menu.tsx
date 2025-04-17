
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => {
  const { headerSettings, loading, error } = useHeaderSettings();

  if (loading) {
    return <LoadingView message="Caricamento menu..." fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div></div>
          <h2 className="text-lg font-medium text-gray-700">Menu</h2>
          <Link to="/home">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <Home size={16} />
              <span>Home</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Menu</h3>
          <p className="text-gray-600 mb-6">
            Questa è la pagina del menu. Il contenuto verrà caricato qui.
          </p>
          <Link to="/home">
            <Button>Torna alla Home</Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Menu;
