import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Pizzerias: React.FC = () => {
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
        <BackToMenu parentPath="/restaurants" />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          <TranslatedText text="Pizzerie" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/where-to-eat" className="inline-flex items-center mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Torna a Dove Mangiare" />
        </Link>

        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Pizzerie" />
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <TranslatedText text="Pizzeria Da Mario" />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text="Autentica pizza napoletana cotta in forno a legna." />
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Indirizzo:" />
              </span>
              <span>Piazza Garibaldi 10, Centro</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Telefono:" />
              </span>
              <span>+39 123 456 7893</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">
                <TranslatedText text="Orari:" />
              </span>
              <span>18:00-23:00</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <TranslatedText text="Napule è" />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text="Pizzeria gourmet con impasti a lunga lievitazione e ingredienti di qualità." />
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Indirizzo:" />
              </span>
              <span>Via Firenze 33, Centro</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Telefono:" />
              </span>
              <span>+39 123 456 7894</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">
                <TranslatedText text="Orari:" />
              </span>
              <span>19:00-23:30, Chiuso lunedì</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pizzerias;
