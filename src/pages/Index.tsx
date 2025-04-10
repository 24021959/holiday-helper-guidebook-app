
import React, { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Settings } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useTranslation } from "@/context/TranslationContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
    
    // Check authentication status
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    
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

  // Navigate to admin or login page
  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };
  
  // Navigate to other pages
  const navigateTo = (path: string) => {
    navigate(path);
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
      {/* Navigation Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Left side - Main navigation */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium text-gray-700 hover:text-emerald-700">
                  <TranslatedText text="Home" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => navigateTo("/menu")}>
                  <TranslatedText text="Menu" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateTo("/welcome")}>
                  <TranslatedText text="Benvenuto" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateTo("/storia")}>
                  <TranslatedText text="Storia" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Right side - Admin button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleAdminClick}
            className="text-gray-600 hover:text-emerald-600"
            title={isAuthenticated ? "Pannello amministrazione" : "Accedi"}
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>
      
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
