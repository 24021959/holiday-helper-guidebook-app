
import React from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import IconNav from "@/components/IconNav";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const Index: React.FC = () => {
  // Component for footer with logo
  const Footer = () => (
    <div className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 py-3 border-t border-gray-200">
      <div className="flex justify-center items-center">
        <img 
          src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
          alt="EVA AI Technologies Logo" 
          className="h-8 md:h-10" 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Header con logo EV-AI a sinistra e testo EV-AI Guest al centro */}
        <Header 
          backgroundColor="bg-white"
          logoUrl="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png"
          showAdminButton={true}
        />
        
        {/* Elementi decorativi di sfondo */}
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-teal-100 opacity-50 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-100 opacity-50 blur-xl"></div>
        
        <Card className="max-w-md w-full flex-1 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden mb-4 mt-4">
          <CardContent className="p-6 h-full flex flex-col">
            <LanguageSelector onSelectLanguage={(langCode) => {
              // Store the language selection in localStorage
              localStorage.setItem("selectedLanguage", langCode);
              // Redirect to menu page
              window.location.href = "/menu";
            }} />
          </CardContent>
        </Card>
        
        {/* Footer con logo */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
