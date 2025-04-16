
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/context/TranslationContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Chatbot from "@/components/chatbot/Chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotConfig, defaultConfig } from "@/hooks/chatbot/chatbotTypes";

// Import new components
import GeneralSettings from "./GeneralSettings";
import VisualSettings from "./VisualSettings";
import WelcomeMessageManager from "./WelcomeMessageManager";
import SuggestedQuestions from "./SuggestedQuestions";
import KnowledgeBaseManager from "./KnowledgeBaseManager";

const ChatbotSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState("general");
  const { translateBulk } = useTranslation();

  useEffect(() => {
    loadChatbotConfig();
  }, []);

  const loadChatbotConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'chatbot_config')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
      } else if (data) {
        setChatbotConfig({
          ...defaultConfig,
          ...data.value as ChatbotConfig
        });
      }
    } catch (error) {
      console.error("Errore nel caricamento della configurazione del chatbot:", error);
      toast.error("Errore nel caricamento della configurazione del chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatbotConfig = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'chatbot_config',
          value: chatbotConfig
        }, { onConflict: 'key' });

      if (error) throw error;

      toast.success("Configurazione del chatbot salvata con successo");
    } catch (error) {
      console.error("Errore nel salvataggio della configurazione del chatbot:", error);
      toast.error("Errore nel salvataggio della configurazione del chatbot");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (field: keyof ChatbotConfig, value: any) => {
    setChatbotConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateTranslations = async () => {
    setIsLoading(true);
    try {
      const italianMessage = chatbotConfig.welcomeMessage.it;
      const languages = ['en', 'fr', 'es', 'de'] as const;
      
      const translatedMessages = await Promise.all(
        languages.map((lang) => 
          translateBulk([italianMessage])
            .then(result => ({ lang, message: result[0] }))
            .catch(() => ({ lang, message: defaultConfig.welcomeMessage[lang] }))
        )
      );
      
      const newWelcomeMessages = {
        it: italianMessage,
        ...Object.fromEntries(translatedMessages.map(({ lang, message }) => [lang, message]))
      };
      
      setChatbotConfig(prev => ({
        ...prev,
        welcomeMessage: newWelcomeMessages
      }));
      
      toast.success("Messaggi di benvenuto generati in tutte le lingue");
    } catch (error) {
      console.error("Errore nella generazione dei messaggi di benvenuto:", error);
      toast.error("Errore nella generazione dei messaggi di benvenuto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-medium text-emerald-600">Impostazioni Chatbot</h2>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Anteprima Chatbot
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-lg">
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4">Anteprima Chatbot</h3>
              <div className="flex-1">
                <Chatbot previewConfig={chatbotConfig} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">Generale</TabsTrigger>
          <TabsTrigger value="visual">Aspetto</TabsTrigger>
          <TabsTrigger value="messages">Messaggi</TabsTrigger>
          <TabsTrigger value="questions">Domande Suggerite</TabsTrigger>
          <TabsTrigger value="knowledge">Base di Conoscenza</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings 
            config={chatbotConfig}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="visual">
          <VisualSettings 
            config={chatbotConfig}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="messages">
          <WelcomeMessageManager 
            config={chatbotConfig}
            onConfigChange={handleConfigChange}
            onGenerateTranslations={generateTranslations}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="questions">
          <SuggestedQuestions 
            config={chatbotConfig}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="knowledge">
          <KnowledgeBaseManager />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button 
          onClick={saveChatbotConfig}
          disabled={isSaving || isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSaving ? 'Salvataggio...' : 'Salva Configurazione'}
        </Button>
      </div>
    </div>
  );
};

export default ChatbotSettings;
