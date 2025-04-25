
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TraditionalTrattorias: React.FC = () => {
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/where-to-eat" className="inline-flex items-center mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Torna a Dove Mangiare" />
        </Link>

        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Trattorie Tipiche" />
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <TranslatedText text="Trattoria Da Lucia" />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text="Cucina casalinga con ricette tramandate da generazioni e ingredienti locali." />
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Indirizzo:" />
              </span>
              <span>Via del Corso 78, Centro Storico</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Telefono:" />
              </span>
              <span>+39 123 456 7895</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">
                <TranslatedText text="Orari:" />
              </span>
              <span>12:00-15:00, 19:00-22:30, Chiuso mercoledì</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <TranslatedText text="Osteria La Campagna" />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text="Piatti della tradizione contadina in un ambiente rustico e accogliente." />
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Indirizzo:" />
              </span>
              <span>Strada Provinciale 15, Località Campagna</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">
                <TranslatedText text="Telefono:" />
              </span>
              <span>+39 123 456 7896</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">
                <TranslatedText text="Orari:" />
              </span>
              <span>Solo cena 18:30-22:00, Sabato e Domenica anche pranzo</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TraditionalTrattorias;
