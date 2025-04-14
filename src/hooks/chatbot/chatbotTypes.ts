export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

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

export const defaultConfig: ChatbotConfig = {
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

export interface ChatbotConversation {
  id: string;
  conversation_id: string;
  user_message: string;
  bot_response: string;
  was_helpful?: boolean;
  feedback?: string;
  corrected_response?: string;
  matched_documents?: any[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ChatbotStats {
  id: string;
  date: string;
  total_conversations: number;
  total_messages: number;
  average_response_time?: number;
  helpful_responses?: number;
  unhelpful_responses?: number;
  created_at: Date;
  updated_at: Date;
}
