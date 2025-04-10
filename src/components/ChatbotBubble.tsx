
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";

// Define a simple configuration type
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

// Default configuration
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
  const [chatbotConfig] = useState<ChatbotConfigType>(defaultConfig);
  
  // Hide the chatbot on admin and login pages
  const isAdminPage = location.pathname.includes('/admin') || 
                     location.pathname.includes('/login');
  
  // Don't show on admin pages
  if (isAdminPage) {
    return null;
  }
  
  try {
    return <Chatbot previewConfig={chatbotConfig} />;
  } catch (error) {
    console.error("Error rendering Chatbot:", error);
    return null;
  }
};

export default ChatbotBubble;
