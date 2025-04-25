
import React from 'react';
import { Card } from "@/components/ui/card";
import TranslatedText from "@/components/TranslatedText";
import { Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const WelcomeContent = () => {
  const handlePhoneClick = () => {
    window.location.href = "tel:+390000000000";
  };

  const handleMapClick = () => {
    window.open("https://maps.google.com/?q=Locanda+dell'Angelo", "_blank");
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6 text-center animate-fade-in">
          <TranslatedText text="Benvenuto alla Locanda dell'Angelo" />
        </h1>
        
        <div className="prose prose-emerald max-w-none text-gray-700 space-y-4">
          <p className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <TranslatedText text="Gentile Ospite," />
          </p>
          
          <p className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <TranslatedText text="Benvenuto alla Locanda dell'Angelo, il luogo ideale per trascorrere una vacanza all'insegna del relax e della scoperta." />
          </p>
          
          <p className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <TranslatedText text="Qui troverai tutte le informazioni utili per rendere il tuo soggiorno confortevole e indimenticabile." />
          </p>

          <div className="flex flex-col md:flex-row gap-4 my-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Button 
              variant="outline"
              className="flex items-center gap-2 hover:bg-emerald-50"
              onClick={handlePhoneClick}
            >
              <Phone className="h-4 w-4" />
              <TranslatedText text="Chiama la Reception" />
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2 hover:bg-emerald-50"
              onClick={handleMapClick}
            >
              <MapPin className="h-4 w-4" />
              <TranslatedText text="Indicazioni Stradali" />
            </Button>
          </div>
          
          <p className="animate-fade-in" style={{ animationDelay: "500ms" }}>
            <TranslatedText text="Ti auguriamo una buona navigazione e un felice soggiorno!" />
          </p>
        </div>
      </div>
    </Card>
  );
};

export default WelcomeContent;
