
import React, { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
}

const Index: React.FC = () => {
  const navigate = useNavigate();
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
        <p className="mt-4 text-emerald-700">
          <TranslatedText text="Caricamento..." />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with settings from database */}
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Elementi decorativi di sfondo */}
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-teal-100 opacity-50 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-100 opacity-50 blur-xl"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">
            <TranslatedText text="Seleziona la tua lingua" as="h1" />
          </h1>
        </div>
        
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden mb-4">
          <CardContent className="p-6">
            <LanguageSelector />
          </CardContent>
        </Card>
      </div>
      
      {/* Footer con credenziali */}
      <Footer />
    </div>
  );
};

export default Index;
