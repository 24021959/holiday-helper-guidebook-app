
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw, Database } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-emerald-600" />
          <h3 className="font-medium">Stato della base di conoscenza</h3>
        </div>
        <Button
          size="sm"
          onClick={onUpdateKnowledgeBase}
          disabled={isProcessing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Elaborazione...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Aggiorna Base di Conoscenza
            </>
          )}
        </Button>
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
            {status.exists ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <span className="font-medium">
              {status.exists
                ? "Base di conoscenza creata"
                : "Base di conoscenza non ancora creata"}
            </span>
          </div>

          {status.exists && (
            <>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagine indicizzate:</span>
                  <span className="font-medium">{status.count}</span>
                </div>
                {status.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ultimo aggiornamento:</span>
                    <span className="font-medium">{status.lastUpdated}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                La base di conoscenza viene utilizzata dal chatbot per rispondere alle domande degli utenti.
              </p>
            </>
          )}

          {!status.exists && (
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
