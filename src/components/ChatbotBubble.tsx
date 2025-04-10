import React from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  
  // Hide chatbot on admin and login pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  // If it's an admin page, don't show the chatbot
  if (isAdminPage) {
    return null;
  }

  // Otherwise, show the Chatbot component with correct positioning
  return (
    <div className="fixed bottom-0 right-0 z-50 chatbot-container">
      <Chatbot />
    </div>
  );
};

export default ChatbotBubble;
