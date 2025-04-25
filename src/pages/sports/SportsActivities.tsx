
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Link } from "react-router-dom";
import { Hiking, Horse, Waves } from "lucide-react";

const SportsActivities: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const sportsCategories = [
    {
      id: "trekking",
      title: "Trekking",
      path: "/sports/trekking",
      icon: <Hiking className="w-12 h-12 text-emerald-600" />,
      description: "Esplora i sentieri naturalistici della zona"
    },
    {
      id: "horse-riding",
      title: "Equitazione",
      path: "/sports/horse-riding",
      icon: <Horse className="w-12 h-12 text-amber-600" />,
      description: "Percorsi a cavallo tra natura e storia"
    },
    {
      id: "water-sports",
      title: "Sport Acquatici",
      path: "/sports/water-sports",
      icon: <Waves className="w-12 h-12 text-cyan-600" />,
      description: "Attività acquatiche per tutti i livelli"
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
        <BackToMenu showBackButton={false} />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          <TranslatedText text="Attività Sportive" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Scopri le Nostre Attività Sportive" />
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sportsCategories.map((category) => (
            <Link 
              key={category.id} 
              to={category.path}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
            >
              <div className="mb-4">
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

export default SportsActivities;
