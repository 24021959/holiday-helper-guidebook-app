
import React from "react";
import BackToMenu from "@/components/BackToMenu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { Loader2 } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useIsMobile } from "@/hooks/use-mobile";
import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeContent from "@/components/welcome/WelcomeContent";

const Welcome: React.FC = () => {
  const { headerSettings, loading, error } = useHeaderSettings();
  const isMobile = useIsMobile();
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">
          <TranslatedText text="Caricamento..." />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100 p-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md shadow-md">
          <h2 className="font-bold text-xl mb-4">Errore</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 ${isMobile ? 'p-0' : 'p-4 md:p-6'}`}>
      <Header 
        backgroundColor={headerSettings.headerColor}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className={`${isMobile ? 'pt-2 px-0' : 'pt-2 px-4'}`}>
        <BackToMenu />
        <div className={`${isMobile ? 'w-full max-w-none px-2' : 'max-w-4xl mx-auto'}`}>
          <WelcomeHero />
          <WelcomeContent />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Welcome;
