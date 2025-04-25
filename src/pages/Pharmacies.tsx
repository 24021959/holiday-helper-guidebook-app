
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Pharmacy } from "lucide-react";

const Pharmacies: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const pharmacyList = [
    {
      name: "Farmacia Centrale",
      address: "Via Roma 123",
      phone: "0123 456789"
    },
    {
      name: "Farmacia Comunale",
      address: "Piazza Libertà 45",
      phone: "0123 987654"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName}
      />
      
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
        <BackToMenu />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          <TranslatedText text="Farmacie" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <TranslatedText text="Farmacie Locali" />
          </h2>
          
          <div className="space-y-4">
            {pharmacyList.map((pharmacy, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6 flex items-center"
              >
                <div className="mr-6 bg-green-100 rounded-full p-3">
                  <Pharmacy className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{pharmacy.name}</h3>
                  <p className="text-gray-600 mb-1">{pharmacy.address}</p>
                  <p className="text-gray-700 font-medium">{pharmacy.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pharmacies;
