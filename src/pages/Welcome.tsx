
import React, { useEffect, useState } from "react";
import BackToMenu from "@/components/BackToMenu";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
}

const Welcome: React.FC = () => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setHeaderSettings({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name
          });
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni header:", error);
        
        // Fallback al localStorage se Supabase fallisce
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Errore nel parsing delle impostazioni dal localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeaderSettings();
  }, []);
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 md:p-6">
      <Header 
        backgroundColor={headerSettings.headerColor}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="pt-2">
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Welcome;
