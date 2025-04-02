
import React, { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import IconNav from "@/components/IconNav";
import { Card, CardContent } from "@/components/ui/card";

const Index: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (langCode: string) => {
    console.log(`Lingua selezionata: ${langCode}`);
    setSelectedLanguage(langCode);
    // In futuro, qui possiamo aggiungere la logica per cambiare la lingua dell'applicazione
  };

  // Component for footer with logo
  const Footer = () => (
    <div className="w-full bg-white py-4 border-t border-gray-200 mt-auto">
      <div className="flex justify-center items-center">
        <img 
          src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
          alt="EVA AI Technologies Logo" 
          className="h-10 md:h-12" 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Conditional rendering based on language selection */}
      {!selectedLanguage ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Header con solo scritta Welcome Book */}
          <div className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 py-4 px-4 mb-4 text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-center">
              <h1 className="text-white font-bold text-xl md:text-2xl tracking-wide">Welcome Book</h1>
            </div>
          </div>
          
          {/* Elementi decorativi di sfondo */}
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-teal-100 opacity-50 blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-100 opacity-50 blur-xl"></div>
          
          <Card className="max-w-md w-full flex-1 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden mb-4">
            <CardContent className="p-6 h-full flex flex-col">
              <LanguageSelector onSelectLanguage={handleLanguageSelect} />
            </CardContent>
          </Card>
          
          {/* Footer con logo */}
          <Footer />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Grande header con "Welcome Book" */}
          <div className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 py-6 text-center shadow-md">
            <h1 className="text-white font-bold text-2xl md:text-3xl tracking-wider">WELCOME BOOK</h1>
          </div>
          
          {/* Contenitore principale che occupa tutto lo spazio disponibile */}
          <div className="flex-1 flex flex-col">
            {/* Grid con le icone che prende tutto lo spazio disponibile */}
            <div className="flex-1 overflow-y-auto">
              <IconNav />
            </div>
          </div>
          
          {/* Footer con logo */}
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Index;
