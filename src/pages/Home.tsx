
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();

  if (loading) {
    return <LoadingView message="Caricamento..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-md">
          <h2 className="font-bold mb-2">Errore:</h2>
          <p>{error}</p>
          <button 
            onClick={refreshHeaderSettings}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Main content area */}
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
