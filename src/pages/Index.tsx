
import React, { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useTranslation } from "@/context/TranslationContext";
import MainNavigation from "@/components/MainNavigation";

interface HeaderSettings {
  logoUrl?: string | null;
  headerColor?: string;
  establishmentName?: string | null;
}

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);
  const { language, setLanguage } = useTranslation();
  
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
        console.error("Error loading header settings:", error);
        
        // Fallback to localStorage if Supabase fails
        const savedHeaderSettings = localStorage.getItem("headerSettings");
        if (savedHeaderSettings) {
          try {
            setHeaderSettings(JSON.parse(savedHeaderSettings));
          } catch (err) {
            console.error("Error parsing settings from localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeaderSettings();
    
    // Reset language to default to ensure proper selection
    setLanguage('it');
  }, [setLanguage]);
  
  // Custom navigation handler for language selection
  const handleLanguageSelect = (selectedLanguage: 'it' | 'en' | 'fr' | 'es' | 'de') => {
    console.log(`Index page - Language selected: ${selectedLanguage}`);
    
    // Set the language in context
    setLanguage(selectedLanguage);
    
    // Navigate to appropriate menu
    if (selectedLanguage === 'it') {
      navigate('/menu');
    } else {
      navigate(`/${selectedLanguage}/menu`);
    }
  };
  
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
      {/* Aggiunta del componente di navigazione principale */}
      <MainNavigation />
      
      {/* Header with settings from database */}
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={false}
      />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-teal-100 opacity-50 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-100 opacity-50 blur-xl"></div>
        
        <div className="max-w-md w-full mb-4">
          <h1 className="text-center text-2xl font-bold text-emerald-800 mb-6">
            <TranslatedText text="Seleziona la tua lingua" />
          </h1>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <LanguageSelector onChange={handleLanguageSelect} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
