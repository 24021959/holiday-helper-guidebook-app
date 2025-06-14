
import { useState, useCallback } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatbotConfig } from './chatbot/useChatbotConfig';
import { useKnowledgeBase } from './chatbot/useKnowledgeBase';
import { useChatMessages } from './chatbot/useChatMessages';
import { ChatbotConfig, Message } from './chatbot/chatbotTypes';

export const useChatbot = (previewConfig?: ChatbotConfig) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language } = useTranslation();

  // Determine if we're in the admin area
  const isAdminArea = useCallback(() => {
    return location.pathname.includes('/admin');
  }, [location]);

  // Get chatbot configuration
  const { config, initializing } = useChatbotConfig(previewConfig);
  
  // Get knowledge base status
  const { knowledgeBaseExists, knowledgeBaseCount, refreshKnowledgeBase } = 
    useKnowledgeBase(previewConfig, isAdminArea);
  
  // Get chat messages
  const { messages, setMessages, addMessage, isLoading, setIsLoading } = 
    useChatMessages(initializing, config.welcomeMessage);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
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
          addMessage(previewResponse);
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

        addMessage(botResponse);
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

        addMessage(errorMessage);
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

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages, language, previewConfig, refreshKnowledgeBase, addMessage, setIsLoading]);

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
    initializing,
    knowledgeBaseExists,
    knowledgeBaseCount,
    refreshKnowledgeBase
  };
};
