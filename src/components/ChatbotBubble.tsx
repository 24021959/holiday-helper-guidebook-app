import React from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  
  // Hide the chatbot on admin and login pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  // If it's an admin page, don't show the chatbot
  if (isAdminPage) {
    return null;
  }

  // Otherwise, show the Chatbot component
  return <Chatbot />;
};

export default ChatbotBubble;
