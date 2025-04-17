import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";
import TranslatedText from "@/components/TranslatedText";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useTranslation();
  
  useEffect(() => {
    // Automatically redirect to the Home page
    // This will ensure that users never see the old Index page
    // We'll keep the language context as Italian by default
    setLanguage('it');
    
    // Redirect to the Home page
    navigate('/home');
  }, [navigate, setLanguage]);
  
  // Show loading spinner during redirect
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
      <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
      <p className="mt-4 text-emerald-700">
        <TranslatedText text="Reindirizzamento alla pagina principale..." />
      </p>
    </div>
  );
};

export default Index;
