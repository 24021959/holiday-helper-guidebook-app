import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Link } from "react-router-dom";
import { Map, Building, Palmtree, Landmark } from "lucide-react";

const Places: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const placeCategories = [
    {
      id: "beaches",
      title: "Spiagge",
      path: "/places/beaches",
      icon: <Palmtree className="w-12 h-12 text-yellow-600" />,
      description: "Scopri le più belle spiagge della zona"
    },
    {
      id: "castles",
      title: "Castelli",
      path: "/places/castles",
      icon: <Building className="w-12 h-12 text-gray-600" />,
      description: "Visita i castelli storici del territorio"
    },
    {
      id: "cities",
      title: "Città",
      path: "/places/cities",
      icon: <Building className="w-12 h-12 text-blue-600" />,
      description: "Esplora le città più affascinanti della regione"
    },
    {
      id: "museums",
      title: "Musei",
      path: "/places/museums",
      icon: <Building className="w-12 h-12 text-amber-600" />,
      description: "Immergiti nella cultura nei nostri musei"
    },
    {
      id: "churches",
      title: "Chiese",
      path: "/places/churches",
      icon: <Landmark className="w-12 h-12 text-purple-600" />,
      description: "Visita le chiese storiche del territorio"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName}
      />
      
      <div className="bg-gradient-to-r from-blue-100 to-sky-100 py-3 px-4 shadow-sm flex items-center">
        <BackToMenu showBackButton={false} />
        <h1 className="text-xl font-medium text-blue-800 flex-1 text-center pr-6">
          <TranslatedText text="Cosa Visitare" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Scopri i Luoghi da Visitare" />
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {placeCategories.map((category) => (
            <Link 
              key={category.id} 
              to={category.path}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
            >
              <div className="mb-4 bg-[#E5DEFF] rounded-full p-3">
                {category.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2">
                <TranslatedText text={category.title} />
              </h2>
              <p className="text-gray-600">
                <TranslatedText text={category.description} />
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Places;
