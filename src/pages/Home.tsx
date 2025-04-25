
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
      
      <div className="border-b border-gray-100 shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <LanguageFlags />
        </div>
      </div>
      
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Il nostro menu di servizi</h1>
        <FilteredIconNav parentPath={null} refreshTrigger={1} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
