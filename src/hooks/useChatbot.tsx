
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';

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
  const [knowledgeBaseExists, setKnowledgeBaseExists] = useState<boolean | null>(null);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState<number>(0);
  const knowledgeBaseCheckedRef = useRef(false);
  const { language } = useTranslation();
  const location = useLocation();

  // Determine if we're in the admin area
  const isAdminArea = useCallback(() => {
    return location.pathname.includes('/admin');
  }, [location]);

  // Check if we're on the home page
  const isHomePage = useCallback(() => {
    return location.pathname === '/' || location.pathname === '';
  }, [location]);

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
    if (!initializing) {
      refreshKnowledgeBase();
    }
  }, [initializing]);

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

      try {
        // Ensure we have the latest knowledge base status
        await refreshKnowledgeBase();
      } catch (err) {
        console.warn("Failed to refresh knowledge base before sending message:", err);
        // Continue anyway to not block the user message
      }

      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log("Sending message to chatbot function:", message);
      console.log("Chat history:", chatHistory);
      
      try {
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
      } catch (apiError) {
        console.error("API error:", apiError);
        
        toast.error("Errore nella comunicazione con il chatbot");
        
        const errorResponse = 
          "Mi dispiace, ho avuto un problema nel rispondere. " +
          "Se hai appena aggiornato la base di conoscenza, potrebbe essere necessario attendere qualche minuto prima che le modifiche siano disponibili. " +
          "Assicurati che la base di conoscenza sia stata creata correttamente dalle impostazioni del chatbot.";
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorResponse,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      
      toast.error("Errore nella comunicazione con il chatbot");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Mi dispiace, ho avuto un problema nel rispondere. Riprova più tardi o contatta l'amministratore del sito.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, language, previewConfig, refreshKnowledgeBase]);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const openChat = useCallback(() => setIsOpen(true), []);

  const refreshKnowledgeBase = useCallback(async () => {
    if (previewConfig) {
      setKnowledgeBaseExists(true);
      setKnowledgeBaseCount(10);
      return true;
    }
    
    // Never show knowledge base notifications on the home page
    if (isHomePage()) {
      setKnowledgeBaseExists(true);
      setKnowledgeBaseCount(0);
      return true;
    }
    
    try {
      console.log("Refreshing knowledge base status...");
      
      // Add a short delay to ensure any recent updates are picked up
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // First check if the table exists to avoid errors
        const { data: tableExists, error: tableExistsError } = await supabase.rpc(
          'table_exists',
          { table_name: 'chatbot_knowledge' }
        ).maybeSingle();
        
        if (tableExistsError) {
          console.error("Error checking if table exists:", tableExistsError);
          // Try a different approach - direct count
          const { count, error: directCountError } = await supabase
            .from('chatbot_knowledge')
            .select('*', { count: 'exact', head: true });
            
          if (directCountError) {
            console.error("Error checking knowledge base via direct count:", directCountError);
            setKnowledgeBaseExists(false);
            setKnowledgeBaseCount(0);
            return false;
          }
          
          const hasContent = count !== null && count > 0;
          setKnowledgeBaseExists(hasContent);
          setKnowledgeBaseCount(count || 0);
          
          console.log(`Knowledge base direct count check result: ${count}`);
          
          // Only show toast notifications in admin area and never on home page
          if (isAdminArea() && !isHomePage() && !knowledgeBaseCheckedRef.current) {
            if (hasContent) {
              toast.success(`Base di conoscenza verificata: ${count} elementi`);
              knowledgeBaseCheckedRef.current = true;
            } else {
              toast.warning("La base di conoscenza è vuota");
              knowledgeBaseCheckedRef.current = true;
            }
          }
          
          return hasContent;
        }
        
        if (!tableExists) {
          console.log("Table doesn't exist");
          setKnowledgeBaseExists(false);
          setKnowledgeBaseCount(0);
          
          // Only show toast notifications in admin area and never on home page
          if (isAdminArea() && !isHomePage() && !knowledgeBaseCheckedRef.current) {
            toast.warning("La tabella della base di conoscenza non esiste");
            knowledgeBaseCheckedRef.current = true;
          }
          
          return false;
        }
        
        // Now check the count
        const { count, error: countError } = await supabase
          .from('chatbot_knowledge')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error("Error checking knowledge base count:", countError);
          setKnowledgeBaseExists(false);
          setKnowledgeBaseCount(0);
          return false;
        }
        
        console.log("Knowledge base check result:", count);
        
        const hasContent = count !== null && count > 0;
        setKnowledgeBaseExists(hasContent);
        setKnowledgeBaseCount(count || 0);
        
        // Only show toast notifications in admin area and never on home page
        if (isAdminArea() && !isHomePage() && !knowledgeBaseCheckedRef.current) {
          if (hasContent) {
            toast.success(`Base di conoscenza verificata: ${count} elementi`);
            knowledgeBaseCheckedRef.current = true;
          } else {
            toast.warning("La base di conoscenza è vuota");
            knowledgeBaseCheckedRef.current = true;
          }
        }
        
        return hasContent;
      } catch (error) {
        console.error("Error checking knowledge base count:", error);
        setKnowledgeBaseExists(false);
        setKnowledgeBaseCount(0);
        return false;
      }
    } catch (error) {
      console.error("Error refreshing knowledge base status:", error);
      setKnowledgeBaseExists(false);
      setKnowledgeBaseCount(0);
      return false;
    }
  }, [previewConfig, isAdminArea, isHomePage]);

  return {
    isOpen,
    messages,
    isLoading,
    config,
    sendMessage,
    toggleChat,
    closeChat,
    openChat,
    initializing,
    knowledgeBaseExists,
    knowledgeBaseCount,
    refreshKnowledgeBase
  };
};
