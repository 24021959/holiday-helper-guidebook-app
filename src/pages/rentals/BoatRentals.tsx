
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";

const BoatRentals: React.FC = () => {
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
          <TranslatedText text="Noleggio Barche" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <img
            src="/photo-1518877593221-1f28583780b4"
            alt="Boat rental"
            className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
          />
          
          <h2 className="text-2xl font-semibold mb-4">
            <TranslatedText text="Le Nostre Imbarcazioni" />
          </h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Barche a Motore" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Gommone 5m: €150/giorno" /></li>
              <li><TranslatedText text="Motoscafo 7m: €250/giorno" /></li>
              <li><TranslatedText text="Yacht 12m: €500/giorno" /></li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Barche a Vela" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Deriva 4m: €80/giorno" /></li>
              <li><TranslatedText text="Cabinato 9m: €200/giorno" /></li>
              <li><TranslatedText text="Catamarano: €350/giorno" /></li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BoatRentals;
