
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Store, MapPin } from "lucide-react";

const Supermarkets: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const supermarketList = [
    {
      name: "SuperMarket Centrale",
      address: "Via Roma 123",
      distance: "500m"
    },
    {
      name: "Market Locale",
      address: "Piazza Libertà 45",
      distance: "1.2 km"
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
          <TranslatedText text="Supermercati" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <TranslatedText text="Supermercati Vicini" />
          </h2>
          
          <div className="space-y-4">
            {supermarketList.map((market, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6 flex items-center"
              >
                <div className="mr-6 bg-amber-100 rounded-full p-3">
                  <Store className="w-12 h-12 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{market.name}</h3>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{market.address}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {market.distance}
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

export default Supermarkets;
