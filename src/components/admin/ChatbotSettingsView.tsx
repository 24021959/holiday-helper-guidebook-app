
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface ChatbotSettingsViewProps {
  chatbotCode: string;
  setChatbotCode: (code: string) => void;
  onSave: () => Promise<void>;
}

export const ChatbotSettingsView: React.FC<ChatbotSettingsViewProps> = ({ 
  chatbotCode, 
  setChatbotCode,
  onSave
}) => {
  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Integrazione Chatbot</h2>
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="mb-4">Inserisci qui sotto il codice di embedding del tuo chatbot:</p>
        <Textarea 
          className="font-mono text-sm h-32 mb-4"
          value={chatbotCode}
          onChange={(e) => setChatbotCode(e.target.value)}
          placeholder="<script defer id='chatbot-script' src='https://...' data-chatbot-id='...'></script>"
        />
        <div className="flex justify-end">
          <Button onClick={onSave}>Salva Configurazione Chatbot</Button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Istruzioni per il chatbot:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Copia il codice di embedding fornito dal tuo provider di chatbot.</li>
            <li>Incolla il codice nel campo di testo sopra.</li>
            <li>Clicca su "Salva Configurazione Chatbot".</li>
            <li>Il chatbot sarà visibile in tutte le pagine del tuo sito.</li>
          </ol>
        </div>
      </div>
    </>
  );
};
