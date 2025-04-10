
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ChatbotConfig {
  enabled: boolean;
  welcomeMessage: Record<string, string>;
  primaryColor: string;
  secondaryColor: string;
  botName: string;
  position: 'right' | 'left';
  iconType: 'default' | 'custom';
  customIconUrl?: string;
}

export const defaultWelcomeMessages = {
  it: "Ciao! Sono qui per aiutarti. Come posso assisterti oggi?",
  en: "Hi! I'm here to help. How can I assist you today?",
  fr: "Bonjour! Je suis là pour vous aider. Comment puis-je vous aider aujourd'hui?",
  es: "¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo ayudarte hoy?",
  de: "Hallo! Ich bin hier um zu helfen. Wie kann ich Ihnen heute helfen?"
};

export const defaultConfig: ChatbotConfig = {
  enabled: true,
  welcomeMessage: { ...defaultWelcomeMessages },
  primaryColor: "#4ade80",
  secondaryColor: "#ffffff",
  botName: "Assistente Virtuale",
  position: 'right',
  iconType: 'default'
};

export const useChatbotConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(defaultConfig);
  
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

  const saveChatbotConfig = async (updatedConfig: ChatbotConfig) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'chatbot_config',
          value: updatedConfig
        }, { onConflict: 'key' });

      if (error) throw error;

      setChatbotConfig(updatedConfig);
      toast.success("Configurazione del chatbot salvata con successo");
    } catch (error) {
      console.error("Error saving chatbot config:", error);
      toast.error("Errore nel salvataggio della configurazione del chatbot");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadChatbotConfig();
  }, []);

  return {
    isLoading,
    isSaving,
    chatbotConfig,
    setChatbotConfig,
    saveChatbotConfig,
    loadChatbotConfig
  };
};
