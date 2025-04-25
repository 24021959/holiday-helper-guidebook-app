import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Restaurants: React.FC = () => {
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
        <BackToMenu showBackButton={false} />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          <TranslatedText text="Ristoranti" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/where-to-eat" className="inline-flex items-center mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Torna a Dove Mangiare" />
        </Link>

        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Ristoranti" />
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <TranslatedText text="Ristorante La Pergola" />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text="Ristorante italiano elegante con vista panoramica e piatti della tradizione." />
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Indirizzo:" />
              </span>
              <span>Via Roma 123, Centro</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Telefono:" />
              </span>
              <span>+39 123 456 7890</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">
                <TranslatedText text="Orari:" />
              </span>
              <span>12:00-15:00, 19:00-23:00</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <TranslatedText text="Osteria del Porto" />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text="Cucina di pesce fresco e specialità marinare in un ambiente accogliente." />
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Indirizzo:" />
              </span>
              <span>Lungomare 45, Porto</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Telefono:" />
              </span>
              <span>+39 123 456 7891</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">
                <TranslatedText text="Orari:" />
              </span>
              <span>19:00-23:30</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Restaurants;
