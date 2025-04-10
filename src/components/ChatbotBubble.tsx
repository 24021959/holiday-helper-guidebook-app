
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Hide the chatbot on admin and login pages
  const isAdminPage = location.pathname.includes('/admin') || 
                     location.pathname.includes('/login');
  
  useEffect(() => {
    const loadChatbotConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'chatbot_config')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading chatbot config:", error);
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
        console.error("Error loading chatbot config:", error);
        // Use default config on error
      } finally {
        setLoading(false);
      }
    };

    loadChatbotConfig();
  }, []);
  
  // Don't render until we've tried to load config, and don't show on admin pages
  if (loading || isAdminPage) {
    return null;
  }
  
  // Only render the chatbot if it's enabled in the config
  if (!chatbotConfig.enabled) {
    return null;
  }

  // Return the chatbot component with safe error boundaries
  try {
    return <Chatbot previewConfig={chatbotConfig} />;
  } catch (error) {
    console.error("Error rendering Chatbot:", error);
    return null;
  }
};

export default ChatbotBubble;
