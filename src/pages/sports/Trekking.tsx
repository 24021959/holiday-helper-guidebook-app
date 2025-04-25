
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";

const Trekking: React.FC = () => {
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
        <BackToMenu parentPath="/sports" />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          <TranslatedText text="Trekking" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <img
            src="/photo-1548550023-2bdb3c5beed7"
            alt="Trekking"
            className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
          />
          
          <h2 className="text-2xl font-semibold mb-4">
            <TranslatedText text="I Nostri Sentieri" />
          </h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Percorsi Facili" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Sentiero del Lago: 3 km, dislivello leggero" /></li>
              <li><TranslatedText text="Bosco Incantato: 2 km, percorso pianeggiante" /></li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Percorsi Impegnativi" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Vetta Panoramica: 8 km, dislivello medio" /></li>
              <li><TranslatedText text="Canyon Avventura: 6 km, terreno impegnativo" /></li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trekking;
