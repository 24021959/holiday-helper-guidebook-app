
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";

const HorseRiding: React.FC = () => {
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
          <TranslatedText text="Equitazione" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <img
            src="/photo-1460999158413-4c27f9e0e96a"
            alt="Horse Riding"
            className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
          />
          
          <h2 className="text-2xl font-semibold mb-4">
            <TranslatedText text="Percorsi a Cavallo" />
          </h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Lezioni per Principianti" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Lezione base: €50/ora" /></li>
              <li><TranslatedText text="Lezione in gruppo: €30/persona" /></li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">
              <TranslatedText text="Escursioni Guidate" />
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><TranslatedText text="Tour Breve (1 ora): €70" /></li>
              <li><TranslatedText text="Tour Lungo (3 ore): €180" /></li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HorseRiding;
