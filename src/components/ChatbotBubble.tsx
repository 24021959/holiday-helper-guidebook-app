
import React from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  
  // Hide chatbot on admin and login pages
  const isAdminOrLoginPage = location.pathname.includes('/admin') || 
                             location.pathname.includes('/login');

  // If it's an admin or login page, don't show the chatbot bubble at all
  if (isAdminOrLoginPage) {
    return null;
  }

  // Only show the actual chatbot component on regular pages
  return (
    <div className="fixed bottom-0 right-0 z-50 chatbot-container">
      <Chatbot />
    </div>
  );
};

export default ChatbotBubble;
