
import React from "react";
import BackToMenu from "@/components/BackToMenu";
import { Card } from "@/components/ui/card";

const Storia: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 md:p-6 pt-20">
      <BackToMenu />
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 rounded-xl overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6 text-center">
              Storia della Locanda dell'Angelo
            </h1>
            
            {/* Immagine di Angelo Paracucchi */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-64 h-64 overflow-hidden rounded-full border-4 border-emerald-100 shadow-lg">
                <img 
                  src="/lovable-uploads/58d4bf64-576d-4ea4-a676-9287a0831bdd.png" 
                  alt="Angelo Paracucchi" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="prose prose-emerald max-w-none text-gray-700 space-y-4">
              <p>
                La Locanda dell'Angelo è il frutto di una passione che ha attraversato generazioni e confini, di una storia che ha inizio nel lontano 1974, quando Angelo Paracucchi, chef di origini umbre e spirito cosmopolita, realizzò il suo sogno di aprire un ristorante di alta cucina italiana in una villa d'autore progettata dall'architetto Vico Magistretti.
              </p>
              
              <p>
                Angelo era un visionario, un innovatore, un artista della cucina. Con la sua creatività e la sua qualità, anticipò alcune delle tendenze della nuova cucina italiana, come l'attenzione alla freschezza e all'eccellenza delle materie prime, il superamento del confine tra dolce e salato, la ricerca sulla struttura biochimica degli alimenti, la collaborazione tra il mondo della cucina e del design.
              </p>
              
              <p>
                La sua filosofia era semplice ma profonda: "La cucina è una fucina dove si modellano le sostanze organolettiche degli alimenti per realizzare un'armoniosa composizione di sapori, colori ed odori. Gli elementi che stimolano le papille gustative sono l'aspro, l'amaro, il dolce ed il salato. Il piatto perfetto è quello che raggiunge tra questi elementi l'equilibrio perfetto".
              </p>
              
              <p>
                La Locanda dell'Angelo divenne presto un punto di riferimento per gli appassionati di gastronomia, grazie alla fama di Paracucchi che si diffuse anche all'estero, tanto da portarlo ad aprire un ristorante a Parigi nel 1984. Nel 1979, la Locanda conquistò la stella Michelin.
              </p>
              
              <p>
                Paracucchi fu anche un appassionato maestro, che formò e ispirò molti giovani chef, tra questi c'era Stefano, suo figlio, che ereditò dal padre non solo la passione per la cucina, ma anche l'amore per la Locanda e per Maria Luisa, la donna che sposò e che lo affiancò nella gestione della Locanda.
              </p>
              
              <p>
                Stefano e Maria Luisa continuarono il lavoro di Angelo con dedizione e competenza. Rinnovarono la Locanda senza perderne l'identità e la tradizione. Trasformarono la villa in un hotel di charme, dove poter soggiornare in una delle 31 camere e suite, arredate con gusto e personalità. Ogni stanza è diversa dalle altre, ma tutte conservano il fascino della villa originale degli anni '70, con grandi vetrate affacciate sul giardino e sulle Alpi Apuane.
              </p>
              
              <p>
                Nelle camere troverete pezzi di arredamento e lampade stile anni '70 di importanti firme come Cassina, Artemide, Flos e Kartell, nella hall e nel ristorante potrete ammirare le sculture di Walter Dell'Amico, Roberto Fiasella, Renzo Ricciardi, i quadri di Mirko Baricchi, Wilfredo Lam, Luigi Galligani…
              </p>
              
              <p>
                La Locanda dell'Angelo è il luogo ideale per rilassarsi e godersi la bellezza della natura, dell'arte e della buona cucina, è un luogo dove si respira la storia di una famiglia che ha fatto della passione il suo mestiere.
              </p>
            </div>
            
            {/* Immagine di Maria Luisa */}
            <div className="mt-8 mb-6 flex justify-center">
              <div className="relative w-64 h-64 overflow-hidden rounded-full border-4 border-emerald-100 shadow-lg">
                <img 
                  src="/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png" 
                  alt="Maria Luisa" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="prose prose-emerald max-w-none text-gray-700">
              <p>
                A custodire questa eredità è Maria Luisa, che ha continuato a gestire la Locanda dopo la scomparsa di Angelo e Stefano. Maria Luisa accoglie gli ospiti con professionalità e gentilezza, è lei che si occupa di mantenere vivo lo spirito della Locanda, curando ogni dettaglio e trasmettendo il suo amore per questo luogo. Vi farà sentire come a casa vostra.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Storia;
