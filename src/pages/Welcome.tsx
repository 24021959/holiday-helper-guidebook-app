
import React, { useEffect, useState } from "react";
import BackToMenu from "@/components/BackToMenu";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { Loader2 } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useIsMobile } from "@/hooks/use-mobile";

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
          <div className="relative w-full h-64 md:h-80 mb-6 overflow-hidden rounded-xl">
            <img 
              src="/lovable-uploads/47eda6f0-892f-48ac-a78f-d40b2f7a41df.png" 
              alt="Locanda dell'Angelo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 rounded-xl overflow-hidden">
            <div className={`${isMobile ? 'p-4' : 'p-6 md:p-8'}`}>
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6 text-center">
                <TranslatedText text="Benvenuto alla Locanda dell'Angelo" />
              </h1>
              
              <div className="prose prose-emerald max-w-none text-gray-700 space-y-4">
                <p><TranslatedText text="Gentile Ospite," /></p>
                
                <p>
                  <TranslatedText text="Benvenuto alla Locanda dell'Angelo, il luogo ideale per trascorrere una vacanza all'insegna del relax e della scoperta." />
                </p>
                
                <p>
                  <TranslatedText text="Qui troverai tutte le informazioni utili per rendere il tuo soggiorno confortevole e indimenticabile: i servizi dell'hotel, reception, servizio colazioni, servizi camera, ristorante, piscina, bike room, conoscere la storia della Locanda e i membri dello staff. Inoltre troverai tutte le informazioni necessarie sui servizi esterni, noleggi, sport, taxi, bus ecc…sulle attrazioni del territorio, su cosa visitare, dove mangiare e altro ancora." />
                </p>
                
                <p>
                  <TranslatedText text="Per facilitare i tuoi spostamenti, ti offriamo la possibilità di consultare i percorsi stradali per raggiungere tutte le località con un semplice clic sul posto da raggiungere." />
                </p>
                
                <p>
                  <TranslatedText text="Ci piacerebbe conoscere la tua opinione: puoi lasciarci un feedback sulla tua esperienza in hotel, dirci cosa ti è piaciuto e cosa possiamo migliorare." />
                </p>
                
                <p><TranslatedText text="Ti auguriamo una buona navigazione e un felice soggiorno!" /></p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Welcome;
