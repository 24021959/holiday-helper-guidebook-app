import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";

const Home: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <div>Caricamento...</div>;
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
        {/* Content removed as per user request */}
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
