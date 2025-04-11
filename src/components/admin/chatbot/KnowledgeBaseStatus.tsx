
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw, Database, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KnowledgeBaseStatusProps {
  status: {
    exists: boolean;
    count: number;
    lastUpdated: string | null;
  };
  isProcessing: boolean;
  processingProgress: number;
  errorMessage: string | null;
  onUpdateKnowledgeBase: () => Promise<void>;
}

const KnowledgeBaseStatus: React.FC<KnowledgeBaseStatusProps> = ({
  status,
  isProcessing,
  processingProgress,
  errorMessage,
  onUpdateKnowledgeBase
}) => {
  const [isCheckingTable, setIsCheckingTable] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);

  // Sync local status with props when they change
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  // Force re-check of the table existence when component mounts or after processing
  useEffect(() => {
    if (!isProcessing) {
      checkKnowledgeBase();
    }
  }, [isProcessing]);

  const checkKnowledgeBase = async () => {
    try {
      setIsCheckingTable(true);
      
      // Check if the table exists
      const { count, error: countError } = await supabase
        .from('chatbot_knowledge')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error checking knowledge base:", countError);
        // Create table if it doesn't exist
        await createTable();
        toast.warning("Creata tabella per la base di conoscenza, ora puoi aggiornarla");
        setLocalStatus({
          exists: false,
          count: 0,
          lastUpdated: null
        });
        return;
      }
      
      if (count === null) {
        console.log("Knowledge base query returned null count");
        setLocalStatus({
          exists: false,
          count: 0,
          lastUpdated: null
        });
        return;
      }
      
      console.log(`Knowledge base contains ${count} records`);
      
      // Get the last updated date if records exist
      let lastUpdated = null;
      if (count > 0) {
        const { data: latestRecord, error: latestError } = await supabase
          .from('chatbot_knowledge')
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (!latestError && latestRecord) {
          lastUpdated = new Date(latestRecord.updated_at).toLocaleString('it-IT');
        }
        
        toast.success(`Base di conoscenza verificata: ${count} elementi`);
      }
      
      // Update local status
      const newStatus = {
        exists: count > 0,
        count: count,
        lastUpdated: lastUpdated
      };
      
      setLocalStatus(newStatus);
      
      if (JSON.stringify(newStatus) !== JSON.stringify(status)) {
        console.log("Knowledge base status changed, setting new status:", newStatus);
      }
    } catch (error) {
      console.error("Error checking knowledge base:", error);
      toast.error("Errore nel verificare la base di conoscenza");
    } finally {
      setIsCheckingTable(false);
    }
  };

  const createTable = async () => {
    try {
      console.log("Attempting to create knowledge base table");
      // Create the knowledge base table directly using SQL
      const { error } = await supabase.rpc('run_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id uuid NOT NULL,
            title text NOT NULL,
            content text NOT NULL, 
            path text NOT NULL,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );
        `
      });
      
      if (error) {
        console.error("Error creating knowledge base table:", error);
      } else {
        console.log("Knowledge base table created or already exists");
      }
    } catch (error) {
      console.error("Error creating table:", error);
    }
  };

  const handleUpdateClick = async () => {
    // Create the table first to ensure it exists
    await createTable();
    // Then proceed with the knowledge base update
    onUpdateKnowledgeBase();
  };

  const handleCheckStatus = async () => {
    await checkKnowledgeBase();
    toast.info("Stato della base di conoscenza aggiornato");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-emerald-600" />
          <h3 className="font-medium">Stato della base di conoscenza</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCheckStatus}
            disabled={isProcessing || isCheckingTable}
          >
            {isCheckingTable ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifica...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verifica Stato
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleUpdateClick}
            disabled={isProcessing || isCheckingTable}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione...
              </>
            ) : isCheckingTable ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifica...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Aggiorna Base di Conoscenza
              </>
            )}
          </Button>
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Aggiornamento in corso...</span>
            <span>{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
          <p className="text-sm text-gray-500 italic">
            Questa operazione potrebbe richiedere alcuni minuti
          </p>
        </div>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && (
        <div className="rounded-lg border p-4 bg-gray-50 space-y-3">
          <div className="flex items-center space-x-2">
            {localStatus.exists ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <span className="font-medium">
              {localStatus.exists
                ? "Base di conoscenza creata"
                : "Base di conoscenza non ancora creata"}
            </span>
          </div>

          {localStatus.exists && (
            <>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagine indicizzate:</span>
                  <span className="font-medium">{localStatus.count}</span>
                </div>
                {localStatus.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ultimo aggiornamento:</span>
                    <span className="font-medium">{localStatus.lastUpdated}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                La base di conoscenza viene utilizzata dal chatbot per rispondere alle domande degli utenti.
              </p>
            </>
          )}

          {!localStatus.exists && (
            <p className="text-sm text-gray-500">
              Crea una base di conoscenza usando i contenuti delle pagine del tuo sito per permettere al chatbot
              di rispondere in modo specifico alle domande degli utenti.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseStatus;
