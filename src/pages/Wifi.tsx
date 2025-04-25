
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import TranslatedText from "@/components/TranslatedText";

const Wifi: React.FC = () => {
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
          <TranslatedText text="WiFi Connection" />
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                <TranslatedText text="Network Name (SSID)" />
              </h2>
              <p className="text-gray-700">HOTEL_WIFI</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">
                <TranslatedText text="Password" />
              </h2>
              <p className="text-gray-700">welcomeguest</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                <TranslatedText text="Instructions" />
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li><TranslatedText text="Go to your device's WiFi settings" /></li>
                <li><TranslatedText text="Select the network named 'HOTEL_WIFI'" /></li>
                <li><TranslatedText text="Enter the password: welcomeguest" /></li>
                <li><TranslatedText text="You're now connected!" /></li>
              </ol>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <TranslatedText text="For any connection issues, please contact the reception." />
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wifi;
