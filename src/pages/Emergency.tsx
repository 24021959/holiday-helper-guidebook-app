import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Ambulance, Phone, MapPin } from "lucide-react";

const Emergency: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const emergencyContacts = [
    {
      title: "Emergenza Medica",
      number: "118",
      icon: <Ambulance className="w-12 h-12 text-rose-600" />
    },
    {
      title: "Carabinieri",
      number: "112",
      icon: <Phone className="w-12 h-12 text-blue-600" />
    },
    {
      title: "Polizia",
      number: "113",
      icon: <MapPin className="w-12 h-12 text-green-600" />
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
          <TranslatedText text="Emergenze" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">
          <TranslatedText text="Numeri di Emergenza" />
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {emergencyContacts.map((contact, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center"
            >
              <div className="mb-4 bg-[#FFDEE2] rounded-full p-3">
                {contact.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatedText text={contact.title} />
              </h3>
              <p className="text-2xl font-bold text-gray-700">{contact.number}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Emergency;
