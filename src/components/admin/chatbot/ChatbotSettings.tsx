
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/context/TranslationContext";
import { Bot, Settings2, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Chatbot from "@/components/chatbot/Chatbot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import KnowledgeBaseManager from "./KnowledgeBaseManager";

interface ChatbotConfig {
  enabled: boolean;
  welcomeMessage: Record<string, string>;
  primaryColor: string;
  secondaryColor: string;
  botName: string;
  position: 'right' | 'left';
  iconType: 'default' | 'custom';
  customIconUrl?: string;
}

const defaultWelcomeMessages = {
  it: "Ciao! Sono qui per aiutarti. Come posso assisterti oggi?",
  en: "Hi! I'm here to help. How can I assist you today?",
  fr: "Bonjour! Je suis là pour vous aider. Comment puis-je vous aider aujourd'hui?",
  es: "¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo ayudarte hoy?",
  de: "Hallo! Ich bin hier um zu helfen. Wie kann ich Ihnen heute helfen?"
};

const ChatbotSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>({
    enabled: true,
    welcomeMessage: { ...defaultWelcomeMessages },
    primaryColor: "#4ade80",
    secondaryColor: "#ffffff",
    botName: "Assistente Virtuale",
    position: 'right',
    iconType: 'default'
  });
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');
  const [welcomeMessage, setWelcomeMessage] = useState(defaultWelcomeMessages.it);
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
        if (error.code !== 'PGRST116') { // not found error
          throw error;
        }
        // If not found, we'll use the default config
      } else if (data) {
        const config = data.value as ChatbotConfig;
        setChatbotConfig({
          ...config,
          // Ensure all languages have a welcome message
          welcomeMessage: {
            ...defaultWelcomeMessages,
            ...config.welcomeMessage
          }
        });
        setWelcomeMessage(config.welcomeMessage[activeLanguage] || defaultWelcomeMessages[activeLanguage]);
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
      const updatedConfig = {
        ...chatbotConfig,
        welcomeMessage: {
          ...chatbotConfig.welcomeMessage,
          [activeLanguage]: welcomeMessage
        }
      };

      setChatbotConfig(updatedConfig);

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'chatbot_config',
          value: updatedConfig
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

  const handleSwitchChange = (checked: boolean) => {
    setChatbotConfig({
      ...chatbotConfig,
      enabled: checked
    });
  };

  const handleConfigChange = (field: keyof ChatbotConfig, value: any) => {
    setChatbotConfig({
      ...chatbotConfig,
      [field]: value
    });
  };

  const handleWelcomeMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWelcomeMessage(event.target.value);
  };

  const handleLanguageChange = (lang: 'it' | 'en' | 'fr' | 'es' | 'de') => {
    // Save current language message before switching
    const updatedWelcomeMessages = {
      ...chatbotConfig.welcomeMessage,
      [activeLanguage]: welcomeMessage
    };
    
    setChatbotConfig({
      ...chatbotConfig,
      welcomeMessage: updatedWelcomeMessages
    });
    
    setActiveLanguage(lang);
    setWelcomeMessage(updatedWelcomeMessages[lang] || defaultWelcomeMessages[lang]);
  };

  const generateMessagesInAllLanguages = async () => {
    setIsLoading(true);
    try {
      const italianMessage = chatbotConfig.welcomeMessage.it || defaultWelcomeMessages.it;
      
      const languages = ['en', 'fr', 'es', 'de'] as const;
      
      const translatedMessages = await Promise.all(
        languages.map((lang) => 
          translateBulk([italianMessage])
            .then(result => ({ lang, message: result[0] }))
            .catch(() => ({ lang, message: defaultWelcomeMessages[lang] }))
        )
      );
      
      const newWelcomeMessages = {
        it: italianMessage,
        ...Object.fromEntries(translatedMessages.map(({ lang, message }) => [lang, message]))
      };
      
      setChatbotConfig({
        ...chatbotConfig,
        welcomeMessage: newWelcomeMessages
      });
      
      setWelcomeMessage(newWelcomeMessages[activeLanguage]);
      
      toast.success("Messaggi di benvenuto generati in tutte le lingue");
    } catch (error) {
      console.error("Errore nella generazione dei messaggi di benvenuto:", error);
      toast.error("Errore nella generazione dei messaggi di benvenuto");
    } finally {
      setIsLoading(false);
    }
  };

  const previewConfig = {
    ...chatbotConfig,
    welcomeMessage: {
      ...chatbotConfig.welcomeMessage,
      [activeLanguage]: welcomeMessage
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
            <Button variant="outline" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Anteprima Chatbot</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Anteprima Chatbot</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <Chatbot previewConfig={previewConfig} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurazione Chatbot</CardTitle>
          <CardDescription>
            Configura il chatbot per il tuo sito web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">Generale</TabsTrigger>
              <TabsTrigger value="messages">Messaggi</TabsTrigger>
              <TabsTrigger value="knowledge">Base di Conoscenza</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Abilita Chatbot</Label>
                  <p className="text-sm text-gray-500">
                    Mostra il chatbot sul sito web
                  </p>
                </div>
                <Switch
                  checked={chatbotConfig.enabled}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="botName">Nome del Bot</Label>
                    <Input
                      id="botName"
                      value={chatbotConfig.botName}
                      onChange={(e) => handleConfigChange('botName', e.target.value)}
                      placeholder="Assistente Virtuale"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Colore Primario</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        className="w-12 p-1 h-10"
                        value={chatbotConfig.primaryColor}
                        onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                      />
                      <Input
                        value={chatbotConfig.primaryColor}
                        onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Posizione</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="position-right"
                        checked={chatbotConfig.position === 'right'}
                        onChange={() => handleConfigChange('position', 'right')}
                      />
                      <Label htmlFor="position-right">Destra</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="position-left"
                        checked={chatbotConfig.position === 'left'}
                        onChange={() => handleConfigChange('position', 'left')}
                      />
                      <Label htmlFor="position-left">Sinistra</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Lingua del messaggio di benvenuto</Label>
                  <div className="flex space-x-2">
                    {(['it', 'en', 'fr', 'es', 'de'] as const).map((lang) => (
                      <Button
                        key={lang}
                        type="button"
                        variant={activeLanguage === lang ? "default" : "outline"}
                        className="px-3 py-1 h-8"
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Messaggio di Benvenuto ({activeLanguage.toUpperCase()})</Label>
                  <Input
                    id="welcomeMessage"
                    value={welcomeMessage}
                    onChange={handleWelcomeMessageChange}
                    placeholder="Messaggio di benvenuto"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateMessagesInAllLanguages}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generazione...' : 'Genera messaggi in tutte le lingue'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="knowledge">
              <KnowledgeBaseManager />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Button 
              onClick={saveChatbotConfig} 
              disabled={isSaving || isLoading}
              className="w-full"
            >
              {isSaving ? 'Salvataggio...' : 'Salva Configurazione'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotSettings;
