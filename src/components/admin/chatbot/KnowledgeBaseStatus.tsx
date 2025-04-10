
import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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
        <span className="text-sm font-medium">Stato base di conoscenza:</span>
        <span className={`text-sm font-medium ${status.exists ? 'text-green-600' : 'text-amber-600'} flex items-center`}>
          {status.exists ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
              Attiva
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
              Non configurata
            </>
          )}
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
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-md my-2">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800">
                La base di conoscenza non è stata ancora creata. Il chatbot funzionerà, ma non avrà 
                informazioni sulle pagine del tuo sito.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
        <div className="flex items-center mb-2">
          <Info className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-sm font-medium text-blue-600">Informazioni sul processo</span>
        </div>
        <p className="text-sm text-slate-700 mb-2">
          L'aggiornamento della base di conoscenza estrae i contenuti dalle pagine pubblicate 
          e li prepara per l'utilizzo da parte del chatbot.
        </p>
        <p className="text-xs text-slate-600">
          • Vengono eliminati i tag HTML e formattati i contenuti<br />
          • Vengono generati embedding vettoriali tramite OpenAI<br />
          • Il contenuto viene salvato in database per le ricerche
        </p>
      </div>
      
      {processingProgress > 0 && (
        <div className="space-y-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Elaborazione in corso...</span>
            <span className="text-sm">{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="w-full" />
          <p className="text-xs text-gray-500 italic">
            Non chiudere questa finestra durante l'elaborazione
          </p>
        </div>
      )}
      
      <Separator className="my-2" />
      
      <Button
        onClick={onUpdateKnowledgeBase}
        disabled={isProcessing}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
        {isProcessing ? 'Aggiornamento in corso...' : 'Aggiorna Base di Conoscenza'}
      </Button>
      
      {errorMessage && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-sm font-medium text-red-600 mb-1">Risoluzione dei problemi:</p>
          <ul className="text-xs space-y-1 text-red-700 list-disc pl-4">
            <li>Verifica che l'API key di OpenAI sia valida</li>
            <li>Controlla che ci siano pagine pubblicate sul sito</li>
            <li>Prova ad aggiornare di nuovo tra qualche minuto</li>
            <li>Controlla i log delle funzioni Edge su Supabase</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseStatus;
