
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

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

const defaultConfig: ChatbotConfig = {
  enabled: true,
  welcomeMessage: {
    it: "Ciao! Sono qui per aiutarti. Come posso assisterti oggi?",
    en: "Hi! I'm here to help. How can I assist you today?",
    fr: "Bonjour! Je suis là pour vous aider. Comment puis-je vous aider aujourd'hui?",
    es: "¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo ayudarte hoy?",
    de: "Hallo! Ich bin hier um zu helfen. Wie kann ich Ihnen heute helfen?"
  },
  primaryColor: "#4ade80",
  secondaryColor: "#ffffff",
  botName: "Assistente Virtuale",
  position: 'right',
  iconType: 'default'
};

export const useChatbot = (previewConfig?: ChatbotConfig) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig>(previewConfig || defaultConfig);
  const [initializing, setInitializing] = useState(true);
  const { language } = useTranslation();

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      setInitializing(false);
      return;
    }
    
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'chatbot_config')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error("Error loading chatbot config:", error);
          }
        } else if (data) {
          setConfig({
            ...defaultConfig,
            ...data.value as ChatbotConfig
          });
        }
      } catch (error) {
        console.error("Error in loading chatbot config:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadConfig();
  }, [previewConfig]);

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
    }
  }, [previewConfig]);

  useEffect(() => {
    if (!initializing && !messages.length) {
      const welcomeMessage = config.welcomeMessage[language] || config.welcomeMessage.en || "Hi! How can I help you today?";
      
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [language, initializing, config, messages.length]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (previewConfig) {
        setTimeout(() => {
          const previewResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: "Questa è un'anteprima del chatbot. In modalità anteprima, non vengono inviate richieste reali all'API.",
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, previewResponse]);
          setIsLoading(false);
        }, 1500);
        return;
      }

      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log("Sending message to chatbot function:", message);
      
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message, 
          language,
          chatHistory
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Errore nella funzione chatbot: ${error.message}`);
      }

      console.log("Response received from chatbot function:", data);

      if (!data || !data.response) {
        throw new Error("Nessuna risposta ricevuta dalla funzione chatbot");
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      
      // Show toast with error message
      toast.error("Errore nella comunicazione con il chatbot");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Mi dispiace, ho avuto un problema nel rispondere. Riprova più tardi o contatta direttamente la struttura.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, language, previewConfig]);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const openChat = useCallback(() => setIsOpen(true), []);

  return {
    isOpen,
    messages,
    isLoading,
    config,
    sendMessage,
    toggleChat,
    closeChat,
    openChat,
    initializing
  };
};
