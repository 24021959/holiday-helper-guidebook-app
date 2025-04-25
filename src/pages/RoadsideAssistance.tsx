
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import PageNavigation from "@/components/PageNavigation";
import { Button } from "@/components/ui/button";
import { Phone, Car } from "lucide-react";

const RoadsideAssistance: React.FC = () => {
  const { headerSettings, loading } = useHeaderSettings();

  if (loading) {
    return <LoadingView fullScreen={true} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName}
      />
      
      <PageNavigation title="Roadside Assistance" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Roadside Assistance" />
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#FFDEE2] rounded-full p-3">
                <Car className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  <TranslatedText text="24/7 Emergency Service" />
                </h2>
                <p className="text-gray-600">+39 118</p>
              </div>
            </div>
            
            <Button 
              variant="destructive"
              className="w-full md:w-auto"
              onClick={() => window.location.href = 'tel:118'}
            >
              <Phone className="w-4 h-4 mr-2" />
              <TranslatedText text="Call Emergency Service" />
            </Button>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                <TranslatedText text="Local Services" />
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">
                    <TranslatedText text="Local Mechanic" />
                  </h4>
                  <p className="text-gray-600">+39 123 456 7891</p>
                </div>
                <div>
                  <h4 className="font-medium">
                    <TranslatedText text="Towing Service" />
                  </h4>
                  <p className="text-gray-600">+39 123 456 7892</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoadsideAssistance;
