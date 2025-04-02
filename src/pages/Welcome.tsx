
import React from "react";
import BackToMenu from "@/components/BackToMenu";
import { Card } from "@/components/ui/card";

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 md:p-6 pt-20">
      <BackToMenu />
      <div className="max-w-4xl mx-auto">
        {/* Immagine dell'hotel */}
        <div className="relative w-full h-64 md:h-80 mb-6 overflow-hidden rounded-xl">
          <img 
            src="/lovable-uploads/47eda6f0-892f-48ac-a78f-d40b2f7a41df.png" 
            alt="Locanda dell'Angelo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 rounded-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6 text-center">
              Benvenuto alla Locanda dell'Angelo
            </h1>
            
            <div className="prose prose-emerald max-w-none text-gray-700 space-y-4">
              <p>Gentile Ospite,</p>
              
              <p>
                Benvenuto alla Locanda dell'Angelo, il luogo ideale per trascorrere una vacanza all'insegna del relax 
                e della scoperta.
              </p>
              
              <p>
                Qui troverai tutte le informazioni utili per rendere il tuo soggiorno confortevole e indimenticabile: 
                i servizi dell'hotel, reception, servizio colazioni, servizi camera, ristorante, piscina, bike room, 
                conoscere la storia della Locanda e i membri dello staff. Inoltre troverai tutte le informazioni 
                necessarie sui servizi esterni, noleggi, sport, taxi, bus ecc…sulle attrazioni del territorio, su 
                cosa visitare, dove mangiare e altro ancora.
              </p>
              
              <p>
                Per facilitare i tuoi spostamenti, ti offriamo la possibilità di consultare i percorsi stradali per 
                raggiungere tutte le località con un semplice clic sul posto da raggiungere.
              </p>
              
              <p>
                Ci piacerebbe conoscere la tua opinione: puoi lasciarci un feedback sulla tua esperienza in hotel, 
                dirci cosa ti è piaciuto e cosa possiamo migliorare.
              </p>
              
              <p>Ti auguriamo una buona navigazione e un felice soggiorno!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
