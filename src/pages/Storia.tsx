
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";

const Storia: React.FC = () => {
  const { headerSettings, loading, error } = useHeaderSettings();
  
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

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <p className="text-red-500 mb-4">
            <TranslatedText text={error} />
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <TranslatedText text="Riprova" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl || undefined}
        backgroundColor={headerSettings.headerColor}
        establishmentName={headerSettings.establishmentName || undefined}
        logoPosition={headerSettings.logoPosition as "left" | "center" | "right" || "left"}
        logoSize={headerSettings.logoSize as "small" | "medium" | "large" || "medium"}
        showAdminButton={false}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 content-container">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-emerald-800 mb-6">
            <TranslatedText text="La Nostra Storia" />
          </h1>
          
          <div className="prose max-w-none readable-text">
            <p>
              <TranslatedText text="Benvenuti nella sezione dedicata alla storia del nostro stabilimento. Qui potrete scoprire come è nato e si è evoluto nel tempo il nostro locale." />
            </p>
            
            <h2 className="text-xl font-semibold text-emerald-700 mt-8 mb-4">
              <TranslatedText text="Le Origini" />
            </h2>
            
            <p>
              <TranslatedText text="Il nostro stabilimento è stato fondato nel 1985 da una famiglia con una grande passione per l'ospitalità e la cucina tradizionale." />
            </p>
            
            <p>
              <TranslatedText text="Inizialmente era un piccolo locale con pochi tavoli, ma grazie alla qualità del servizio e all'autenticità delle ricette, ha rapidamente guadagnato popolarità tra i residenti e i turisti della zona." />
            </p>
            
            <h2 className="text-xl font-semibold text-emerald-700 mt-8 mb-4">
              <TranslatedText text="L'Evoluzione" />
            </h2>
            
            <p>
              <TranslatedText text="Nel corso degli anni, lo stabilimento si è ampliato e rinnovato più volte, mantenendo sempre vivo lo spirito originale." />
            </p>
            
            <p>
              <TranslatedText text="Abbiamo introdotto nuovi piatti, seguendo le tendenze culinarie ma senza mai dimenticare le nostre radici. La nostra filosofia è sempre stata quella di valorizzare i prodotti locali e le ricette della tradizione." />
            </p>
            
            <h2 className="text-xl font-semibold text-emerald-700 mt-8 mb-4">
              <TranslatedText text="Oggi" />
            </h2>
            
            <p>
              <TranslatedText text="Oggi il nostro stabilimento è un punto di riferimento per la gastronomia locale. Continuiamo a servire piatti preparati con ingredienti freschi e di qualità, in un ambiente accogliente e familiare." />
            </p>
            
            <p>
              <TranslatedText text="La nostra missione è far sentire ogni cliente come a casa propria, offrendo un'esperienza culinaria autentica e memorabile. Siamo orgogliosi di mantenere viva la tradizione gastronomica del nostro territorio." />
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Storia;
