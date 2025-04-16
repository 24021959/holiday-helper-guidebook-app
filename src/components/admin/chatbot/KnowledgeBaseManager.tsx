
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KnowledgeBaseManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    exists: boolean;
    count: number;
    lastUpdated: string | null;
  }>({
    exists: false,
    count: 0,
    lastUpdated: null
  });

  useEffect(() => {
    checkKnowledgeBase();
  }, []);

  const checkKnowledgeBase = async () => {
    try {
      setError(null);
      console.log("Checking knowledge base status...");
      
      const { count, error: countError } = await supabase
        .from('chatbot_knowledge')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error checking knowledge base:", countError);
        throw new Error(`Database error: ${countError.message}`);
      }
      
      let lastUpdated = null;
      
      if (count && count > 0) {
        // Get latest update timestamp
        const { data: latestRecord, error: latestError } = await supabase
          .from('chatbot_knowledge')
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (!latestError && latestRecord) {
          lastUpdated = new Date(latestRecord.updated_at).toLocaleString('it-IT');
        }
        
        console.log("Knowledge base exists with", count, "items. Latest update:", lastUpdated);
        toast.success(`Base di conoscenza verificata: ${count} elementi`);
      } else {
        console.log("Knowledge base is empty or doesn't exist");
        toast.warning("La base di conoscenza è vuota");
      }
      
      setStatus({
        exists: count ? count > 0 : false,
        count: count || 0,
        lastUpdated
      });
    } catch (error) {
      console.error("Error checking knowledge base:", error);
      setError(`Errore nella verifica: ${error.message}`);
      toast.error(`Errore nella verifica della base di conoscenza: ${error.message}`);
    }
  };

  const updateKnowledgeBase = async () => {
    setIsLoading(true);
    setProgress(10);
    setError(null);
    
    try {
      // Fetch all published pages
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('published', true);

      if (pagesError) throw pagesError;

      if (!pages || pages.length === 0) {
        toast.warning("Nessuna pagina trovata per creare la base di conoscenza del chatbot");
        setError("Nessuna pagina pubblicata trovata per creare la base di conoscenza");
        setIsLoading(false);
        setProgress(0);
        return;
      }

      toast.info(`Elaborazione di ${pages.length} pagine per la base di conoscenza...`);
      setProgress(20);
      
      // First, clear the existing knowledge base
      const { error: clearError } = await supabase
        .from('chatbot_knowledge')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (clearError) {
        console.error("Error clearing knowledge base:", clearError);
        throw new Error(`Error clearing knowledge base: ${clearError.message}`);
      }
      
      setProgress(40);
      
      // Process pages in batches to avoid timeouts
      const batchSize = 5;
      let processedCount = 0;
      
      for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, Math.min(i + batchSize, pages.length));
        
        // Process each page in the batch
        await Promise.all(batch.map(async (page) => {
          try {
            // Call our Edge Function to process the page
            const { data, error } = await supabase.functions.invoke('process-page-content', {
              body: { page }
            });
            
            if (error) throw error;
            
            processedCount++;
            const progressPercentage = Math.min(90, 40 + Math.floor((processedCount / pages.length) * 50));
            setProgress(progressPercentage);
            
            return data;
          } catch (error) {
            console.error(`Error processing page ${page.id}:`, error);
            throw error;
          }
        }));
      }
      
      // Final update
      setProgress(100);
      toast.success(`Base di conoscenza aggiornata con successo: ${processedCount} pagine elaborate`);
      
      // Refresh status
      await checkKnowledgeBase();
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      setError(`Errore nell'aggiornamento della base di conoscenza: ${error.message}`);
      toast.error(`Errore nell'aggiornamento della base di conoscenza: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Base di Conoscenza del Chatbot</h3>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Stato base di conoscenza:</span>
          <span className={`text-sm font-medium ${status.exists ? 'text-green-600' : 'text-amber-600'}`}>
            {status.exists ? 'Attiva' : 'Non configurata'}
          </span>
        </div>
        
        {status.exists && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">Elementi presenti:</span>
              <span className="text-sm">{status.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ultimo aggiornamento:</span>
              <span className="text-sm">{status.lastUpdated}</span>
            </div>
          </>
        )}
        
        {!status.exists && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm text-amber-800">
              La base di conoscenza non è stata ancora creata. Il chatbot funzionerà, ma non avrà 
              informazioni sulle pagine del tuo sito.
            </AlertDescription>
          </Alert>
        )}
        
        {progress > 0 && (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Elaborazione in corso...</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription className="text-sm text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={updateKnowledgeBase}
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Aggiornamento...' : 'Aggiorna Base di Conoscenza'}
          </Button>
          
          <Button
            onClick={checkKnowledgeBase}
            disabled={isLoading}
            variant="outline"
            className="px-3"
          >
            Verifica Stato
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Questo processo aggiorna la base di conoscenza del chatbot con i contenuti delle pagine pubblicate sul sito.
          La base di conoscenza è utilizzata dal chatbot per rispondere alle domande degli utenti.
        </p>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
