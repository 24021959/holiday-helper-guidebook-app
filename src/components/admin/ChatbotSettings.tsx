import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/context/TranslationContext";
import { Bot, RefreshCw, Settings2, MessageSquare, Globe } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

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
  const { translateBulk } = useTranslation();

  useEffect(() => {
    loadChatbotConfig();
  }, []);

  useEffect(() => {
    setWelcomeMessage(chatbotConfig.welcomeMessage[activeLanguage] || defaultWelcomeMessages[activeLanguage]);
  }, [activeLanguage, chatbotConfig.welcomeMessage]);

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
      }
    } catch (error) {
      console.error("Error loading chatbot config:", error);
      toast.error("Errore nel caricamento della configurazione del chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatbotConfig = async () => {
    setIsSaving(true);
    try {
      // Ensure the welcomeMessage for the activeLanguage is saved
      const updatedConfig = {
        ...chatbotConfig,
        welcomeMessage: {
          ...chatbotConfig.welcomeMessage,
          [activeLanguage]: welcomeMessage
        }
      };

      setChatbotConfig(updatedConfig);

      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'chatbot_config',
          value: updatedConfig
        }, { onConflict: 'key' });

      if (error) throw error;

      toast.success("Configurazione del chatbot salvata con successo");
    } catch (error) {
      console.error("Error saving chatbot config:", error);
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

  const handlePositionChange = (position: 'right' | 'left') => {
    setChatbotConfig({
      ...chatbotConfig,
      position
    });
  };

  const handleIconTypeChange = (iconType: 'default' | 'custom') => {
    setChatbotConfig({
      ...chatbotConfig,
      iconType
    });
  };

  const generateMessagesInAllLanguages = async () => {
    setIsLoading(true);
    try {
      // Generate welcome messages for all languages based on the Italian one
      const italianMessage = chatbotConfig.welcomeMessage.it || defaultWelcomeMessages.it;
      
      const languages = ['en', 'fr', 'es', 'de'] as const;
      const messagesToTranslate = languages.map(() => italianMessage);
      
      const translatedMessages = await Promise.all(
        languages.map((lang, index) => 
          translateBulk([messagesToTranslate[index]])
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
      console.error("Error generating welcome messages:", error);
      toast.error("Errore nella generazione dei messaggi di benvenuto");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePageContent = async () => {
    setIsLoading(true);
    try {
      // Fetch all pages to create a knowledge base for the chatbot
      const { data: pages, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('published', true);

      if (error) throw error;

      if (!pages || pages.length === 0) {
        toast.warning("Nessuna pagina trovata per creare la base di conoscenza del chatbot");
        return;
      }

      // Create knowledge base for embedding
      const formattedContent = pages.map(page => ({
        id: page.id,
        title: page.title,
        content: page.content,
        path: page.path
      }));

      // Send to embedding function
      const { data, error: embedError } = await supabase.functions.invoke(
        'create-chatbot-knowledge',
        {
          body: { pages: formattedContent }
        }
      );

      if (embedError) throw embedError;

      toast.success(`Base di conoscenza del chatbot aggiornata con ${pages.length} pagine`);
    } catch (error) {
      console.error("Error updating chatbot knowledge base:", error);
      toast.error("Errore nell'aggiornamento della base di conoscenza del chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full chatbot-settings">
      <div className="flex items-center space-x-2 mb-6">
        <Bot className="h-6 w-6 text-emerald-600" />
        <h2 className="text-xl font-medium text-emerald-600">Impostazioni Chatbot</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Attiva Chatbot</h3>
              <p className="text-sm text-gray-500">
                Abilita o disabilita il chatbot sul tuo sito
              </p>
            </div>
            <Switch
              checked={chatbotConfig.enabled}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Impostazioni Generali</h3>
            
            <div className="space-y-2">
              <Label htmlFor="botName">Nome del Bot</Label>
              <Input
                id="botName"
                value={chatbotConfig.botName}
                onChange={(e) =>
                  setChatbotConfig({
                    ...chatbotConfig,
                    botName: e.target.value
                  })
                }
                placeholder="Assistente Virtuale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Colore Principale</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={chatbotConfig.primaryColor}
                  onChange={(e) =>
                    setChatbotConfig({
                      ...chatbotConfig,
                      primaryColor: e.target.value
                    })
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={chatbotConfig.primaryColor}
                  onChange={(e) =>
                    setChatbotConfig({
                      ...chatbotConfig,
                      primaryColor: e.target.value
                    })
                  }
                  placeholder="#4ade80"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Colore Secondario</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={chatbotConfig.secondaryColor}
                  onChange={(e) =>
                    setChatbotConfig({
                      ...chatbotConfig,
                      secondaryColor: e.target.value
                    })
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={chatbotConfig.secondaryColor}
                  onChange={(e) =>
                    setChatbotConfig({
                      ...chatbotConfig,
                      secondaryColor: e.target.value
                    })
                  }
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Posizione del Chatbot</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={chatbotConfig.position === 'right' ? 'default' : 'outline'}
                  onClick={() => handlePositionChange('right')}
                  className={chatbotConfig.position === 'right' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  Destra
                </Button>
                <Button
                  type="button"
                  variant={chatbotConfig.position === 'left' ? 'default' : 'outline'}
                  onClick={() => handlePositionChange('left')}
                  className={chatbotConfig.position === 'left' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  Sinistra
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo di Icona</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={chatbotConfig.iconType === 'default' ? 'default' : 'outline'}
                  onClick={() => handleIconTypeChange('default')}
                  className={chatbotConfig.iconType === 'default' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  Predefinita
                </Button>
                <Button
                  type="button"
                  variant={chatbotConfig.iconType === 'custom' ? 'default' : 'outline'}
                  onClick={() => handleIconTypeChange('custom')}
                  className={chatbotConfig.iconType === 'custom' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  Personalizzata
                </Button>
              </div>
            </div>

            {chatbotConfig.iconType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customIconUrl">URL Icona Personalizzata</Label>
                <Input
                  id="customIconUrl"
                  value={chatbotConfig.customIconUrl || ''}
                  onChange={(e) =>
                    setChatbotConfig({
                      ...chatbotConfig,
                      customIconUrl: e.target.value
                    })
                  }
                  placeholder="https://example.com/icon.png"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Azioni</h3>
            
            <div className="space-y-2">
              <Button
                onClick={updatePageContent}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Aggiorna Base di Conoscenza del Chatbot
              </Button>
              <p className="text-xs text-gray-500">
                Aggiorna la base di conoscenza del chatbot con i contenuti più recenti delle pagine del sito.
              </p>
            </div>
          </div>
        </div>

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

          <div className="space-y-4 bg-gray-50 border rounded-lg p-4">
            <h3 className="text-lg font-medium">Anteprima</h3>
            <div className="relative p-5 border rounded-lg bg-white shadow-sm min-h-[250px]">
              <div className="absolute bottom-4 right-4 bg-emerald-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-md">
                <Bot className="h-6 w-6" />
              </div>
              <div className="absolute bottom-20 right-4 max-w-xs bg-white rounded-lg shadow-md p-3 border-l-4 border-emerald-500">
                <div className="text-xs text-emerald-600 font-medium mb-1">{chatbotConfig.botName}</div>
                <p className="text-sm text-gray-700">{welcomeMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={saveChatbotConfig}
          disabled={isSaving || isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {isSaving ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </div>
    </div>
  );
};

export default ChatbotSettings;
