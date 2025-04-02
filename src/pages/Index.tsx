
import React, { useState } from "react";
import Header from "@/components/Header";
import { LanguageSelector } from "@/components/LanguageSelector";
import IconNav from "@/components/IconNav";

const Index: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (langCode: string) => {
    console.log(`Selected language: ${langCode}`);
    setSelectedLanguage(langCode);
    // In futuro, qui possiamo aggiungere la logica per cambiare la lingua dell'applicazione
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Conditional rendering based on language selection */}
      {!selectedLanguage ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-medium text-center mb-6">
            Seleziona la tua lingua / Select your language
          </h2>
          <LanguageSelector onSelectLanguage={handleLanguageSelect} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Icon Navigation */}
          <IconNav />
          
          {/* Content Area - Empty for now, will be populated in future updates */}
          <div className="flex-1 p-4 mx-auto max-w-4xl w-full">
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h2 className="text-2xl font-bold mb-4">Benvenuto!</h2>
              <p className="text-gray-700">
                Seleziona una delle icone sopra per esplorare il Welcome Book.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
