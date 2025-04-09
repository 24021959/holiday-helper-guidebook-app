
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  
  // Skip enhanced visibility checks on admin pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  useEffect(() => {
    if (isAdminPage) return;
    
    // Since the script is now in the head, we only need to ensure 
    // the chatbot elements remain visible with CSS
    const ensureChatbotVisible = () => {
      try {
        // Target SupportFast elements specifically
        const chatElements = document.querySelectorAll(
          '#supportfast-widget, .supportfast-widget, .supportfast-container, ' +
          '.supportfast-bubble, .supportfast-button, #supportfast-button, ' +
          '#supportfast-chat, .supportfast-chat, #supportfast-container, ' + 
          '.supportfast-container, .supportfast-root, #supportfast-root'
        );
        
        if (chatElements.length > 0) {
          console.log("Found SupportFast elements, ensuring visibility: ", chatElements.length);
          chatElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.zIndex = '9999';
              el.style.display = 'block';
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.pointerEvents = 'auto';
            }
          });
        } else {
          console.log("No SupportFast elements found yet");
        }
      } catch (error) {
        console.error("Error ensuring chatbot visibility:", error);
      }
    };
    
    // Check frequently to ensure the chatbot remains visible
    const visibilityInterval = setInterval(ensureChatbotVisible, 1000);
    
    // Add debug info in dev mode
    if (process.env.NODE_ENV === 'development') {
      const debugDiv = document.createElement('div');
      debugDiv.id = 'chatbot-debug-info';
      debugDiv.style.position = 'fixed';
      debugDiv.style.bottom = '10px';
      debugDiv.style.left = '10px';
      debugDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
      debugDiv.style.color = 'white';
      debugDiv.style.padding = '5px';
      debugDiv.style.zIndex = '9999';
      debugDiv.style.fontSize = '10px';
      debugDiv.textContent = 'ChatbotBubble mounted: ' + new Date().toISOString();
      document.body.appendChild(debugDiv);
    }
    
    return () => {
      clearInterval(visibilityInterval);
      const debugDiv = document.getElementById('chatbot-debug-info');
      if (debugDiv) debugDiv.remove();
    };
  }, [isAdminPage, location.pathname]);

  // Just a placeholder element to ensure the component is mounted
  return null;
};

export default ChatbotBubble;
