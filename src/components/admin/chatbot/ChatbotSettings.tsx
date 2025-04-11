import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/context/TranslationContext";
import { Bot, Settings2, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Chatbot from "@/components/chatbot/Chatbot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import KnowledgeBaseStatus from "./KnowledgeBaseStatus";
import WelcomeMessageEditor from "./WelcomeMessageEditor";
import ChatbotPreview from "./ChatbotPreview";
import ChatbotGeneralSettings from "./ChatbotGeneralSettings";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [knowledgeStatus, setKnowledgeStatus] = useState<{
    exists: boolean;
    count: number;
    lastUpdated: string | null;
  }>({
    exists: false,
    count: 0,
    lastUpdated: null
  });
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
    checkKnowledgeBase();
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
      }
    } catch (error) {
      console.error("Errore nel caricamento della configurazione del chatbot:", error);
      toast.error("Errore nel caricamento della configurazione del chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  const checkKnowledgeBase = async () => {
    try {
      setProcessingError(null);
      
      try {
        const { error: tableError } = await supabase.rpc('run_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              page_id uuid NOT NULL,
              title text NOT NULL,
              content text NOT NULL, 
              path text NOT NULL,
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now()
            );
          `
        });
        
        if (tableError && tableError.message !== "function run_sql does not exist") {
          console.error("Error creating table:", tableError);
        }
      } catch (tableError) {
        console.error("Error creating table:", tableError);
      }

      try {
        const { count, error: countError } = await supabase
          .from('chatbot_knowledge')
          .select('*', { count: 'exact', head: true })
          .limit(1);
        
        if (countError) {
          // Table likely doesn't exist or other error
          console.error("Error checking knowledge base:", countError);
          setKnowledgeStatus({
            exists: false,
            count: 0,
            lastUpdated: null
          });
          return;
        }
        
        let lastUpdated = null;
        
        if (count && count > 0) {
          // Try to get the latest update timestamp
          const { data: latestRecord, error: latestError } = await supabase
            .from('chatbot_knowledge')
            .select('updated_at')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (!latestError && latestRecord) {
            lastUpdated = new Date(latestRecord.updated_at).toLocaleString('it-IT');
          }
          
          console.log("Knowledge base exists with", count, "items. Latest update:", lastUpdated);
          
          // Show confirmation toast with count
          toast.success(`Base di conoscenza verificata: ${count} elementi`);
        } else {
          console.log("Knowledge base is empty or doesn't exist");
        }
        
        setKnowledgeStatus({
          exists: count ? count > 0 : false,
          count: count || 0,
          lastUpdated
        });
      } catch (error) {
        console.error("Error checking knowledge base:", error);
        setKnowledgeStatus({
          exists: false,
          count: 0,
          lastUpdated: null
        });
      }
    } catch (error) {
      console.error("Error checking knowledge base:", error);
      setProcessingError("Errore nel controllare la base di conoscenza");
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

      const { data, error } = await supabase
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

  const handleWelcomeMessageChange = (lang: string, message: string) => {
    setWelcomeMessage(message);
    setChatbotConfig({
      ...chatbotConfig,
      welcomeMessage: {
        ...chatbotConfig.welcomeMessage,
        [lang]: message
      }
    });
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

  const updatePageContent = async () => {
    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingError(null);
    
    try {
      // First ensure the table exists
      try {
        const { error: tableError } = await supabase.rpc('run_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              page_id uuid NOT NULL,
              title text NOT NULL,
              content text NOT NULL, 
              path text NOT NULL,
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now()
            );
          `
        });
        
        if (tableError && tableError.message !== "function run_sql does not exist") {
          console.error("Error creating table:", tableError);
        }
      } catch (tableError) {
        console.error("Error creating table:", tableError);
        // Continue anyway - we'll try direct inserts
      }

      // Clear existing data for fresh update
      try {
        const { error: deleteError } = await supabase
          .from('chatbot_knowledge')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
          
        if (deleteError) {
          console.error("Error clearing existing data:", deleteError);
        } else {
          console.log("Successfully cleared existing data");
        }
      } catch (clearError) {
        console.error("Error clearing existing data:", clearError);
        // Continue anyway
      }

      // Fetch all published pages
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('published', true);

      if (pagesError) throw pagesError;

      if (!pages || pages.length === 0) {
        toast.warning("Nessuna pagina trovata per creare la base di conoscenza del chatbot");
        setProcessingError("Nessuna pagina pubblicata trovata per creare la base di conoscenza");
        setIsProcessing(false);
        setProcessingProgress(0);
        return;
      }

      toast.info(`Elaborazione di ${pages.length} pagine per la base di conoscenza...`);
      
      // Process pages in smaller batches to avoid timeout
      const batchSize = 3;
      let processedCount = 0;
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, Math.min(i + batchSize, pages.length));
        const batchPromises = batch.map(async (page) => {
          try {
            console.log(`Processing page ${page.id}: ${page.title}`);
            
            // Simplified approach: Insert directly to database with basic content extraction
            const cleanContent = (page.content || "")
              .replace(/<[^>]*>/g, " ")
              .replace(/<!--.*?-->/g, "")
              .replace(/\s+/g, " ")
              .trim();
            
            let listItemsText = "";
            if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
              listItemsText = "\n\nItems in this page:\n" + 
                page.list_items.map((item: any, index: number) => 
                  `${index + 1}. ${item.name || ""} - ${item.description || ""}`
                ).join("\n");
            }
            
            const formattedContent = `
Page Title: ${page.title || "Untitled"}
URL Path: ${page.path || ""}
Content: ${cleanContent}${listItemsText}
            `.trim();
            
            const { error: insertError } = await supabase
              .from("chatbot_knowledge")
              .insert({
                page_id: page.id,
                title: page.title || "Untitled",
                content: formattedContent,
                path: page.path || ""
              });
              
            if (insertError) {
              throw insertError;
            }
            
            console.log(`Page ${page.id} processed successfully with direct database insert`);
            return true;
          } catch (error) {
            console.error(`Failed to process page ${page.id}:`, error);
            return false;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        processedCount += batch.length;
        successCount += batchResults.filter(result => result).length;
        failureCount += batchResults.filter(result => !result).length;
        
        const progressPercentage = Math.round((processedCount / pages.length) * 90);
        setProcessingProgress(progressPercentage);
      }
      
      setProcessingProgress(100);
      
      if (successCount > 0) {
        toast.success(`Base di conoscenza aggiornata con ${successCount} pagine`);
        
        if (failureCount > 0) {
          toast.warning(`${failureCount} pagine non sono state elaborate correttamente`);
        }
        
        await checkKnowledgeBase();
      } else {
        setProcessingError(`Nessuna pagina è stata elaborata correttamente. Riprova più tardi.`);
        toast.error("Errore nell'aggiornamento della base di conoscenza");
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento della base di conoscenza:", error);
      setProcessingError(`Errore nell'aggiornamento della base di conoscenza: ${error.message}`);
      toast.error("Errore nell'aggiornamento della base di conoscenza");
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProcessingProgress(0);
      }, 1500);
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
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Anteprima Chatbot
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl">
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-medium my-4">Anteprima Chatbot</h3>
              <div className="flex-1 bg-gray-100 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 italic">
                    Questa è un'anteprima del chatbot con le impostazioni attuali
                  </p>
                </div>
                <Chatbot previewConfig={previewConfig} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
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

          <ChatbotGeneralSettings 
            config={chatbotConfig}
            onConfigChange={handleConfigChange}
          />

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Base di conoscenza</span>
              </CardTitle>
              <CardDescription>
                Crea una base di conoscenza per il chatbot utilizzando i contenuti delle pagine del sito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <KnowledgeBaseStatus 
                status={knowledgeStatus}
                isProcessing={isProcessing}
                processingProgress={processingProgress}
                errorMessage={processingError}
                onUpdateKnowledgeBase={updatePageContent}
                onCheckStatus={checkKnowledgeBase}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <WelcomeMessageEditor 
            welcomeMessage={chatbotConfig.welcomeMessage}
            onWelcomeMessageChange={handleWelcomeMessageChange}
            onGenerateAllLanguages={generateMessagesInAllLanguages}
            isLoading={isLoading}
          />

          <ChatbotPreview 
            primaryColor={chatbotConfig.primaryColor}
            botName={chatbotConfig.botName}
            welcomeMessage={welcomeMessage}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings2 className="h-5 w-5 text-emerald-600" />
                <span>Comportamento del Chatbot</span>
              </CardTitle>
              <CardDescription>
                Il chatbot è configurato per rispondere utilizzando informazioni provenienti dalle pagine del tuo sito.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 text-gray-700">
                <p>
                  L'assistente virtuale è programmato per:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Rispondere a domande sulla struttura (orari, servizi, regole)</li>
                  <li>Fornire informazioni sugli spazi comuni (piscina, ristorante, ecc.)</li>
                  <li>Suggerire opzioni gastronomiche e attrazioni turistiche</li>
                  <li>Offrire supporto logistico (indicazioni, trasporti, ecc.)</li>
                </ul>
                <p className="mt-3 text-gray-600 italic">
                  Il chatbot utilizzerà solo le informazioni trovate nelle pagine del sito, senza inventare dettagli.
                  Se una domanda va oltre le informazioni disponibili, consiglierà di contattare direttamente la struttura.
                </p>
              </div>
            </CardContent>
          </Card>
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
