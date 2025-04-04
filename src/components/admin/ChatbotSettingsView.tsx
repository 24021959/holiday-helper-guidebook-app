
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
  const [isSaving, setIsSaving] = useState(false);

  const saveChatbotSettings = async () => {
    try {
      setIsSaving(true);
      
      // Validate the chatbot code - ensure it contains a script tag
      if (!chatbotCode.includes('<script')) {
        toast.error("Il codice inserito non sembra essere un tag script valido");
        setIsSaving(false);
        return;
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({ id: 1, code: chatbotCode })
        .select();

      if (error) throw error;
      
      // Also save to localStorage for client-side access
      localStorage.setItem("chatbotCode", chatbotCode);
      
      // Call the parent onSave function
      await onSave();
      
      // Reinitialize chatbot if exists on page
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
        
        // Add a delay to ensure the old script is fully removed
        setTimeout(() => {
          // Extract script details and reinitialize
          const srcMatch = chatbotCode.match(/src=['"](.*?)['"]/);
          const dataIdMatch = chatbotCode.match(/data-chatbot-id=['"](.*?)['"]/);
          
          if (srcMatch && srcMatch[1]) {
            const script = document.createElement("script");
            script.id = "chatbot-script";
            script.defer = true;
            script.src = srcMatch[1];
            
            if (dataIdMatch && dataIdMatch[1]) {
              script.setAttribute("data-chatbot-id", dataIdMatch[1]);
            }
            
            script.setAttribute("data-element", "chatbot-container");
            script.setAttribute("data-position", "right");
            
            document.head.appendChild(script);
            console.log("Chatbot reinizializzato dopo il salvataggio");
            
            // Create container if it doesn't exist
            if (!document.getElementById("chatbot-container")) {
              const chatbotContainer = document.createElement("div");
              chatbotContainer.id = "chatbot-container";
              document.body.appendChild(chatbotContainer);
            }
          }
        }, 500);
      }
      
      toast.success("Configurazione chatbot salvata con successo");
    } catch (error) {
      console.error("Errore nel salvataggio delle impostazioni chatbot:", error);
      toast.error("Errore nel salvataggio delle impostazioni chatbot");
    } finally {
      setIsSaving(false);
    }
  };

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
          <Button 
            onClick={saveChatbotSettings} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio in corso...
              </>
            ) : (
              "Salva Configurazione Chatbot"
            )}
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Istruzioni per il chatbot:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Copia il codice di embedding fornito dal tuo provider di chatbot.</li>
            <li>Incolla il codice nel campo di testo sopra.</li>
            <li>Clicca su "Salva Configurazione Chatbot".</li>
            <li>Il chatbot sarà visibile in tutte le pagine del tuo sito, eccetto il pannello di amministrazione.</li>
          </ol>
        </div>
      </div>
    </>
  );
};
