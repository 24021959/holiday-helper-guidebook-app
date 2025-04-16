
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
  messageBackgroundColor?: string;
  messageTextColor?: string;
  userMessageBackgroundColor?: string;
  userMessageTextColor?: string;
  suggestedQuestions?: Record<string, string[]>;
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
  iconType: 'default',
  suggestedQuestions: {
    it: ["Quali sono i vostri orari?", "Come posso contattarvi?", "Dove siete situati?"],
    en: ["What are your opening hours?", "How can I contact you?", "Where are you located?"],
    fr: ["Quels sont vos horaires d'ouverture?", "Comment puis-je vous contacter?", "Où êtes-vous situés?"],
    es: ["¿Cuáles son sus horarios?", "¿Cómo puedo contactarlos?", "¿Dónde están ubicados?"],
    de: ["Was sind Ihre Öffnungszeiten?", "Wie kann ich Sie kontaktieren?", "Wo befinden Sie sich?"]
  }
};
