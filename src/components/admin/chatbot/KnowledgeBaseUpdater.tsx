
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KnowledgeBaseUpdaterProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const KnowledgeBaseUpdater: React.FC<KnowledgeBaseUpdaterProps> = ({ isLoading, setIsLoading }) => {
  const updatePageContent = async () => {
    setIsLoading(true);
    try {
      // Fetch all pages to create a knowledge base for the chatbot
      const { data: pages, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('published', true);

      if (error) throw error;

      if (!pages || pages.length === 0) {
        toast.warning("Nessuna pagina trovata per creare la base di conoscenza del chatbot");
        return;
      }

      toast.info(`Elaborazione di ${pages.length} pagine per la base di conoscenza...`);

      // Miglioramento: suddividi i contenuti in frammenti più piccoli per una knowledge base migliore
      const contentChunks = [];
      
      for (const page of pages) {
        // Pulisci il contenuto HTML
        const cleanContent = (page.content || "").replace(/<[^>]*>/g, " ").trim();
        
        // Dividi il contenuto in paragrafi e poi in frammenti più piccoli
        const paragraphs = cleanContent.split(/\n\n+/);
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i].trim();
          if (paragraph.length < 50) continue; // Salta paragrafi troppo brevi
          
          // Crea un chunk con contesto e metadati
          contentChunks.push({
            id: page.id,
            title: page.title,
            content: `${page.title}: ${paragraph}`,
            path: page.path,
            list_items: page.list_items
          });
        }
        
        // Aggiungi anche un chunk con il contenuto completo della pagina
        contentChunks.push({
          id: page.id,
          title: page.title,
          content: `Riepilogo completo: ${page.title}\n${cleanContent}`,
          path: page.path,
          list_items: page.list_items
        });
      }

      // Send to embedding function
      const { data, error: embedError } = await supabase.functions.invoke(
        'create-chatbot-knowledge',
        {
          body: { pages: contentChunks }
        }
      );

      if (embedError) {
        console.error("Embedding function error:", embedError);
        throw embedError;
      }

      if (data && data.success) {
        toast.success(`Base di conoscenza del chatbot aggiornata con ${data.message}`);
      } else {
        const errorMessage = data ? data.error : "Errore sconosciuto";
        console.error("Embedding function returned error:", errorMessage);
        toast.error(`Errore: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating chatbot knowledge base:", error);
      toast.error("Errore nell'aggiornamento della base di conoscenza del chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Azioni</h3>
        
        <div className="space-y-2">
          <Button
            onClick={updatePageContent}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aggiorna Base di Conoscenza del Chatbot
          </Button>
          <p className="text-xs text-gray-500">
            Aggiorna la base di conoscenza del chatbot con i contenuti più recenti delle pagine del sito.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseUpdater;
