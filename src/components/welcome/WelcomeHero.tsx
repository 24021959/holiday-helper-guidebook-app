
import React from 'react';

const WelcomeHero = () => {
  return (
    <div className="relative w-full h-64 md:h-80 mb-6 overflow-hidden rounded-xl animate-fade-in">
      <img 
        src="/lovable-uploads/47eda6f0-892f-48ac-a78f-d40b2f7a41df.png" 
        alt="Locanda dell'Angelo" 
        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
};

export default WelcomeHero;
