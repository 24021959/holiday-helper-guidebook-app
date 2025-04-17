
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import FilteredIconNav from "@/components/FilteredIconNav";

const Menu: React.FC = () => {
  const { headerSettings, loading, error } = useHeaderSettings();

  if (loading) {
    return <LoadingView message="Caricamento menu..." fullScreen={true} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
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
      
      <main className="flex-1 container mx-auto p-4">
        <FilteredIconNav parentPath={null} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Menu;
