
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import FilteredIconNav from "@/components/FilteredIconNav";
import { useIsMobile } from "@/hooks/use-mobile";
import NavigateBack from "@/components/NavigateBack";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Menu: React.FC = () => {
  const { headerSettings, loading, error } = useHeaderSettings();
  const isMobile = useIsMobile();
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const handleRetry = () => {
    toast.info("Tentativo di ricaricamento del menu...");
    setRetryCount(prev => prev + 1);
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  if (loading) {
    return <LoadingView message="Caricamento menu..." fullScreen={true} />;
  }

  return (
    <div className={`flex flex-col h-screen ${isMobile ? 'w-full p-0 m-0 max-w-none' : ''}`}>
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <NavigateBack />
          <h2 className="text-lg font-medium text-gray-700">Menu</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoHome}
            className="flex items-center gap-1"
          >
            <Home size={16} />
            <span>Home</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-auto">
        <FilteredIconNav 
          parentPath={null} 
          refreshTrigger={retryCount}
          onRefresh={handleRetry}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Menu;
