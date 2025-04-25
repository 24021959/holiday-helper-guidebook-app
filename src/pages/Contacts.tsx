
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { Phone, Mail, MapPin } from "lucide-react";

const Contacts: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView />;
  }

  const contactList = [
    {
      title: "Recepzione",
      info: "0123 456789",
      icon: <Phone className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Email",
      info: "info@example.com",
      icon: <Mail className="w-8 h-8 text-emerald-600" />
    },
    {
      title: "Indirizzo",
      info: "Via Principale 123, Città",
      icon: <MapPin className="w-8 h-8 text-red-600" />
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
          <TranslatedText text="Contatti" />
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <TranslatedText text="Contatti Utili" />
          </h2>
          
          <div className="space-y-4">
            {contactList.map((contact, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
              >
                <div className="bg-gray-100 rounded-full p-3">
                  {contact.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    <TranslatedText text={contact.title} />
                  </h3>
                  <p className="text-gray-700">{contact.info}</p>
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

export default Contacts;
