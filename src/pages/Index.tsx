
import React from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import IconNav from "@/components/IconNav";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Header con logo EV-AI a sinistra e testo EV-AI Guest al centro */}
        <Header 
          backgroundColor="bg-white"
          logoUrl="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png"
          showAdminButton={false}
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
        
        {/* Footer con credenziali */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
