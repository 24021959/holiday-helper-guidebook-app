
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/context/TranslationContext";
import { useToast } from "@/hooks/use-toast";

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { language } = useTranslation();
  const { toast } = useToast();
  
  // Set default SupportFast chatbot code if empty
  useEffect(() => {
    if (!chatbotCode) {
      setChatbotCode('<script defer id="supportfast-script" src="https://cdn.supportfast.ai/chatbot.js" data-chatbot-id="bot-ufqmgj3gyj"></script>');
    }
  }, [chatbotCode, setChatbotCode]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    try {
      await onSave();
      setSaveSuccess(true);
      toast({
        title: "Chatbot impostato correttamente",
        description: "Le modifiche saranno visibili su tutte le pagine del sito dopo il riavvio.",
      });
      
      // Salviamo in localStorage per un effetto immediato
      localStorage.setItem("chatbotCode", chatbotCode);
      
      // Forziamo il ricaricamento della pagina per applicare le modifiche
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      setSaveError(true);
      toast({
        variant: "destructive",
        title: "Errore nel salvataggio",
        description: "Si è verificato un errore durante il salvataggio delle impostazioni del chatbot.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-emerald-600 mb-4">Impostazioni Chatbot</h2>
        <p className="text-sm text-gray-500 mb-4">
          Inserisci il codice JavaScript del chatbot per integrarlo nel tuo sito web.
          Assicurati di includere il tag <code>&lt;script&gt;</code> completo fornito dal servizio di chatbot.
        </p>
        
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Il chatbot sarà visibile in tutte le pagine pubbliche del sito. Per una corretta visualizzazione, il codice verrà inserito nell'HEAD del documento HTML.
          </AlertDescription>
        </Alert>
        
        {saveSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Impostazioni chatbot salvate con successo! Il chatbot sarà visibile dopo il riavvio.
            </AlertDescription>
          </Alert>
        )}
        
        {saveError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Si è verificato un errore durante il salvataggio.
            </AlertDescription>
          </Alert>
        )}
        
        <Textarea
          value={chatbotCode}
          onChange={(e) => setChatbotCode(e.target.value)}
          placeholder='<script defer id="supportfast-script" src="https://cdn.supportfast.ai/chatbot.js" data-chatbot-id="bot-ufqmgj3gyj"></script>'
          className="font-mono min-h-[150px]"
        />
        
        <div className="mt-4 flex gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Salva Impostazioni"
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              window.location.reload();
            }}
          >
            Ricarica Pagina
          </Button>
        </div>
      </div>
    </div>
  );
};
