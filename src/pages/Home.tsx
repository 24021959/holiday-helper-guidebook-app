
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import ErrorDisplay from "@/components/home/ErrorDisplay";
import { LanguageFlags } from "@/components/LanguageFlags";
import FilteredIconNav from "@/components/FilteredIconNav";

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
      />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-center mb-6">
          <LanguageFlags />
        </div>
        <FilteredIconNav parentPath={null} refreshTrigger={1} />
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
