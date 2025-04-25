
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Taxi: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Taxi Service" />
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Phone className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">
                  <TranslatedText text="Local Taxi Service" />
                </h2>
                <p className="text-gray-600">+39 123 456 7890</p>
              </div>
            </div>
            
            <Button 
              className="w-full md:w-auto"
              onClick={() => window.location.href = 'tel:+391234567890'}
            >
              <Phone className="w-4 h-4 mr-2" />
              <TranslatedText text="Call Taxi" />
            </Button>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                <TranslatedText text="Additional Information" />
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><TranslatedText text="Available 24/7" /></li>
                <li><TranslatedText text="Fixed rate from hotel to airport: €50" /></li>
                <li><TranslatedText text="Credit cards accepted" /></li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Taxi;
