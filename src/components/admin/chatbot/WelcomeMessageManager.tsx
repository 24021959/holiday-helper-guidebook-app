
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Globe } from "lucide-react";
import { ChatbotConfig } from "@/hooks/chatbot/chatbotTypes";

interface WelcomeMessageManagerProps {
  config: ChatbotConfig;
  onConfigChange: (field: keyof ChatbotConfig, value: any) => void;
  onGenerateTranslations: () => Promise<void>;
  isLoading: boolean;
}

const WelcomeMessageManager: React.FC<WelcomeMessageManagerProps> = ({
  config,
  onConfigChange,
  onGenerateTranslations,
  isLoading
}) => {
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');

  const handleWelcomeMessageChange = (message: string) => {
    const updatedWelcomeMessage = {
      ...config.welcomeMessage,
      [activeLanguage]: message
    };
    onConfigChange('welcomeMessage', updatedWelcomeMessage);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <span>Messaggi di Benvenuto</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Seleziona Lingua:</span>
          </div>
          
          <div className="flex space-x-2">
            {(['it', 'en', 'fr', 'es', 'de'] as const).map((lang) => (
              <Button
                key={lang}
                variant={activeLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLanguage(lang)}
                className={activeLanguage === lang ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <Textarea
          value={config.welcomeMessage[activeLanguage] || ''}
          onChange={(e) => handleWelcomeMessageChange(e.target.value)}
          placeholder={`Inserisci il messaggio di benvenuto in ${activeLanguage.toUpperCase()}`}
          className="min-h-[100px]"
        />

        <div className="flex justify-end">
          <Button
            onClick={onGenerateTranslations}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Globe className="mr-2 h-4 w-4" />
            {isLoading ? 'Generazione...' : 'Genera in Tutte le Lingue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessageManager;
