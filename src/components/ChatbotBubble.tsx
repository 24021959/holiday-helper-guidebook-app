import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatbotConfigType {
  enabled: boolean;
  primaryColor: string;
  secondaryColor: string;
  botName: string;
  position: 'right' | 'left';
  welcomeMessage: Record<string, string>;
  iconType: 'default' | 'custom';
  customIconUrl?: string;
}

const defaultConfig: ChatbotConfigType = {
  enabled: true,
  primaryColor: "#4ade80",
  secondaryColor: "#ffffff",
  botName: "Assistente Virtuale",
  position: 'right',
  welcomeMessage: {
    it: "Ciao! Sono qui per aiutarti. Come posso assisterti oggi?",
    en: "Hi! I'm here to help. How can I assist you today?",
    fr: "Bonjour! Je suis là pour vous aider. Comment puis-je vous aider aujourd'hui?",
    es: "¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo ayudarte hoy?",
    de: "Hallo! Ich bin hier um zu helfen. Wie kann ich Ihnen heute helfen?"
  },
  iconType: 'default'
};

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfigType>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    const loadChatbotConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'chatbot_config')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // not found error
            console.error("Error loading chatbot config:", error);
          }
          // Default to enabled if not found
          setLoading(false);
          return;
        }
        
        if (data && data.value) {
          // Ensure we have a valid configuration by merging with defaults
          const config = {
            ...defaultConfig,
            ...(typeof data.value === 'object' ? data.value : {})
          };
          
          setChatbotConfig(config);
        }
      } catch (error) {
        console.error("Error in loading chatbot config:", error);
        setError(true);
        // Use default config on error
      } finally {
        setLoading(false);
      }
    };

    try {
      loadChatbotConfig();
    } catch (err) {
      console.error("Fatal error in ChatbotBubble:", err);
      setError(true);
      setLoading(false);
    }
  }, []);
  
  // Hide the chatbot on admin and login pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  // If it's an admin page or loading or disabled, don't show the chatbot
  if (isAdminPage || loading || !chatbotConfig.enabled || error) {
    return null;
  }

  // Wrap in try-catch to prevent blank screen on render errors
  try {
    // Otherwise, show the Chatbot component with the configuration
    return <Chatbot previewConfig={chatbotConfig} />;
  } catch (err) {
    console.error("Error rendering Chatbot:", err);
    return null;
  }
};

export default ChatbotBubble;
