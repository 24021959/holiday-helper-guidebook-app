
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Globe } from "lucide-react";
import { type ChatbotConfig } from "./useChatbotConfig";
import { useTranslation } from "@/context/TranslationContext";
import { toast } from "sonner";

interface WelcomeMessageEditorProps {
  config: ChatbotConfig;
  onConfigChange: (config: ChatbotConfig) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const WelcomeMessageEditor: React.FC<WelcomeMessageEditorProps> = ({ config, onConfigChange, isLoading, setIsLoading }) => {
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const { translateBulk } = useTranslation();

  useEffect(() => {
    setWelcomeMessage(config.welcomeMessage[activeLanguage] || '');
  }, [activeLanguage, config.welcomeMessage]);

  const updateWelcomeMessage = () => {
    onConfigChange({
      ...config,
      welcomeMessage: {
        ...config.welcomeMessage,
        [activeLanguage]: welcomeMessage
      }
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (welcomeMessage !== config.welcomeMessage[activeLanguage]) {
        updateWelcomeMessage();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [welcomeMessage]);

  const generateMessagesInAllLanguages = async () => {
    setIsLoading(true);
    try {
      // Generate welcome messages for all languages based on the Italian one
      const italianMessage = config.welcomeMessage.it || '';
      
      const languages = ['en', 'fr', 'es', 'de'] as const;
      const textsToTranslate = [italianMessage];
      
      const results = await Promise.all(
        languages.map(async (lang) => {
          try {
            const translated = await translateBulk(textsToTranslate);
            return { lang, message: translated[0] };
          } catch (error) {
            console.error(`Error translating to ${lang}:`, error);
            return { lang, message: config.welcomeMessage[lang] || '' };
          }
        })
      );
      
      const newWelcomeMessages = {
        it: italianMessage,
        ...Object.fromEntries(results.map(({ lang, message }) => [lang, message]))
      };
      
      onConfigChange({
        ...config,
        welcomeMessage: newWelcomeMessages
      });
      
      toast.success("Messaggi di benvenuto generati in tutte le lingue");
    } catch (error) {
      console.error("Error generating welcome messages:", error);
      toast.error("Errore nella generazione dei messaggi di benvenuto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
            Messaggio di Benvenuto
          </h3>
          
          <div className="flex items-center">
            <Button
              onClick={generateMessagesInAllLanguages}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Globe className="mr-1 h-3 w-3" />
              Genera in Tutte le Lingue
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label className="flex-shrink-0">Lingua:</Label>
            <div className="bg-gray-100 rounded p-2 flex items-center space-x-2 overflow-x-auto w-full">
              {['it', 'en', 'fr', 'es', 'de'].map((lang) => (
                <Button
                  key={lang}
                  variant={activeLanguage === lang ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveLanguage(lang as 'it' | 'en' | 'fr' | 'es' | 'de')}
                  className={activeLanguage === lang ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-xs'}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          
          <Textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Inserisci il messaggio di benvenuto per questa lingua..."
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessageEditor;
