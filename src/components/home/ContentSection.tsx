
import React from 'react';
import { Button } from '@/components/ui/button';
import TranslatedText from '@/components/TranslatedText';
import { toast } from 'sonner';

type ContentSectionProps = {
  onExploreMenu: () => void;
};

const ContentSection: React.FC<ContentSectionProps> = ({ onExploreMenu }) => {
  const handleExploreClick = () => {
    toast.info("Caricamento menu...");
    onExploreMenu();
  };
  
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-emerald-800">
          <TranslatedText text="Benvenuti alla Locanda dell'Angelo" />
        </h1>
        
        <div className="prose prose-emerald mb-8">
          <p className="text-lg">
            <TranslatedText text="Esplora il nostro menu digitale e scopri tutte le informazioni sul nostro hotel, i nostri servizi e la nostra posizione." />
          </p>
          <p>
            <TranslatedText text="La nostra struttura offre comfort moderni in un ambiente tradizionale italiano. Siamo felici di darvi il benvenuto e rendere il vostro soggiorno il più piacevole possibile." />
          </p>
        </div>
        
        <div className="flex justify-center mt-8 mb-12">
          <Button 
            onClick={handleExploreClick} 
            className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
          >
            <TranslatedText text="Esplora il nostro Menu" />
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ContentSection;
