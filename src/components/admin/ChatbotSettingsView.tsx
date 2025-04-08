
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/context/TranslationContext";

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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    try {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      setSaveError(true);
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
        </p>
        
        {saveSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Impostazioni chatbot salvate con successo!
            </AlertDescription>
          </Alert>
        )}
        
        {saveError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Si è verificato un errore durante il salvataggio. Le impostazioni sono state salvate localmente, ma potrebbero non essere persistenti.
            </AlertDescription>
          </Alert>
        )}
        
        <Textarea
          value={chatbotCode}
          onChange={(e) => setChatbotCode(e.target.value)}
          placeholder="Inserisci qui il codice JavaScript del chatbot..."
          className="font-mono min-h-[200px]"
        />
        
        <div className="mt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvataggio..." : "Salva Impostazioni"}
          </Button>
        </div>
      </div>
    </div>
  );
};
