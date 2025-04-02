
import React, { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import IconNav from "@/components/IconNav";
import { Card, CardContent } from "@/components/ui/card";

const Index: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (langCode: string) => {
    console.log(`Selected language: ${langCode}`);
    setSelectedLanguage(langCode);
    // In futuro, qui possiamo aggiungere la logica per cambiare la lingua dell'applicazione
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Conditional rendering based on language selection */}
      {!selectedLanguage ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Elementi decorativi di sfondo */}
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-teal-100 opacity-50 blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-100 opacity-50 blur-xl"></div>
          
          <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-center mb-8">
                <img 
                  src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
                  alt="EVA AI Technologies Logo" 
                  className="w-64 h-auto"
                />
              </div>
              <LanguageSelector onSelectLanguage={handleLanguageSelect} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Logo at the top */}
          <div className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 py-4 px-4 text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex justify-center">
              <img 
                src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
                alt="EVA AI Technologies Logo" 
                className="h-12 md:h-16"
              />
            </div>
          </div>
          
          {/* Icon Navigation */}
          <IconNav />
          
          {/* Content Area */}
          <div className="flex-1 p-4 mx-auto max-w-4xl w-full">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden mt-4 transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2"></div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-emerald-800 flex items-center">
                  <span className="text-3xl mr-2">👋</span> Benvenuto!
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Seleziona una delle icone sopra per esplorare il Welcome Book e scoprire tutti i servizi e le informazioni per rendere il tuo soggiorno indimenticabile.
                </p>
                
                {/* Aggiungiamo una sezione decorativa */}
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <h3 className="text-lg font-medium text-emerald-700 mb-2">Consiglio del giorno</h3>
                  <p className="text-emerald-600 text-sm">
                    Visita la sezione "Attività" per scoprire le esperienze più popolari nella zona e prenotare in anticipo per evitare code!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
