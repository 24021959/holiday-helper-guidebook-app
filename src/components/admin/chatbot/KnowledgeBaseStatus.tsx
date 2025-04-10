
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface KnowledgeBaseStatusProps {
  status: {
    exists: boolean;
    count: number;
    lastUpdated: string | null;
  };
  isProcessing: boolean;
  processingProgress: number;
  onUpdateKnowledgeBase: () => Promise<void>;
}

const KnowledgeBaseStatus: React.FC<KnowledgeBaseStatusProps> = ({
  status,
  isProcessing,
  processingProgress,
  onUpdateKnowledgeBase
}) => {
  return (
    <div className="space-y-4">
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
      
      {processingProgress > 0 && (
        <div className="space-y-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Elaborazione in corso...</span>
            <span className="text-sm">{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="w-full" />
        </div>
      )}
      
      <Button
        onClick={onUpdateKnowledgeBase}
        disabled={isProcessing}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-2"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
        {isProcessing ? 'Aggiornamento in corso...' : 'Aggiorna Base di Conoscenza'}
      </Button>
      
      <p className="text-xs text-gray-500 mt-1">
        Questo processo aggiorna la base di conoscenza del chatbot con i contenuti delle pagine pubblicate sul sito.
        L'aggiornamento potrebbe richiedere alcuni minuti.
      </p>
    </div>
  );
};

export default KnowledgeBaseStatus;
