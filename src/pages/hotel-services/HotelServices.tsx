
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import BackToMenu from "@/components/BackToMenu";
import FilteredIconNav from "@/components/FilteredIconNav";

const HotelServices = () => {
  const { headerSettings } = useHeaderSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        backgroundColor={headerSettings.headerColor}
        logoUrl={headerSettings.logoUrl}
        establishmentName={headerSettings.establishmentName}
      />
      
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
        <BackToMenu showBackButton={false} />
        <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
          Servizi Hotel
        </h1>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-700 text-lg mb-8">
            Scopri i servizi esclusivi del nostro hotel: dalla reception 24/7 alla nostra piscina, 
            dal ristorante gourmet alla bike room dedicata agli appassionati di ciclismo.
          </p>
          
          <FilteredIconNav parentPath="/hotel-services" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HotelServices;
