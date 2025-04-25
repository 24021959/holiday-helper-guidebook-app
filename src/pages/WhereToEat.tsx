
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import { UtensilsCrossed, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

const WhereToEat: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const categories = [
    {
      id: "restaurants",
      title: "Ristoranti",
      path: "/restaurants",
      icon: <UtensilsCrossed className="w-12 h-12 text-blue-600" />,
      description: "I migliori ristoranti della zona"
    },
    {
      id: "pizzerias",
      title: "Pizzerie",
      path: "/pizzerias",
      icon: <Utensils className="w-12 h-12 text-red-600" />,
      description: "Pizzerie con autentica pizza italiana"
    },
    {
      id: "traditional",
      title: "Trattorie Tipiche",
      path: "/traditional",
      icon: <Utensils className="w-12 h-12 text-green-600" />,
      description: "Gustare la tradizione culinaria locale"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Dove Mangiare" />
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
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

export default WhereToEat;
