
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";

const VehicleRentals: React.FC = () => {
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
      
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
        <BackToMenu parentPath="/rentals" />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          <TranslatedText text="Noleggio Auto e Moto" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <img
            src="/photo-1487887235947-a955ef187fcc"
            alt="Vehicle rental"
            className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
          />
          
          <h2 className="text-2xl font-semibold mb-4">
            <TranslatedText text="I Nostri Veicoli" />
          </h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Auto" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Auto compatte: da €50/giorno" /></li>
              <li><TranslatedText text="Auto medie: da €70/giorno" /></li>
              <li><TranslatedText text="SUV: da €90/giorno" /></li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Moto" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Scooter 125cc: da €30/giorno" /></li>
              <li><TranslatedText text="Moto 300cc: da €45/giorno" /></li>
              <li><TranslatedText text="Moto 500cc+: da €60/giorno" /></li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VehicleRentals;
