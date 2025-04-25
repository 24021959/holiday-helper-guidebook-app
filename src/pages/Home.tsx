import React from 'react';
import { Home as HouseIcon } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import ErrorDisplay from "@/components/home/ErrorDisplay";
import { LanguageFlags } from "@/components/LanguageFlags";
import FilteredIconNav from "@/components/FilteredIconNav";
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();

  if (loading) {
    return <LoadingView message="Caricamento..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshHeaderSettings} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      >
        <Link 
          to="/welcome" 
          className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-full hover:bg-emerald-100 transition-colors"
        >
          <HouseIcon 
            className="text-emerald-700 hover:text-emerald-800" 
            size={24} 
          />
        </Link>
      </Header>
      
      <div className="border-b border-gray-100 shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <LanguageFlags />
        </div>
      </div>
      
      <main className="flex-1 container mx-auto p-4">
        <FilteredIconNav parentPath={null} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
