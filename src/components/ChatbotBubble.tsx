
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";

// Importiamo Chatbot in modo lazy per evitare errori di rendering
const Chatbot = lazy(() => import("./Chatbot"));

// Configurazione di default
const defaultConfig = {
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
  
  // Nascondi il chatbot nelle pagine di admin e login
  const isAdminPage = location.pathname.includes('/admin') || 
                     location.pathname.includes('/login');
  
  if (isAdminPage) {
    return null;
  }
  
  // Utilizziamo Suspense anche qui per gestire il caricamento del chatbot
  return (
    <Suspense fallback={null}>
      <ErrorBoundary>
        <Chatbot previewConfig={defaultConfig} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Componente di gestione degli errori per evitare che gli errori del chatbot causino problemi all'app
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Chatbot error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default ChatbotBubble;
