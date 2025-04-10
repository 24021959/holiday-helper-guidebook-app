
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  
  // Nascondi il chatbot nelle pagine admin e login
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  // Se è una pagina admin, non mostrare il chatbot
  if (isAdminPage) {
    return null;
  }

  // Altrimenti, mostra il componente Chatbot con posizione corretta
  return (
    <div className="chatbot-container z-50">
      <Chatbot />
    </div>
  );
};

export default ChatbotBubble;
