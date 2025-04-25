
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import PageNavigation from "@/components/PageNavigation";

const Beaches: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName}
      />
      
      <PageNavigation title="Spiagge" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">
            <TranslatedText text="Le Nostre Spiagge" />
          </h2>
          
          <div className="prose max-w-none">
            <TranslatedText 
              text="Contenuto in arrivo..."
              className="text-gray-600"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Beaches;
