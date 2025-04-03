
import React, { useEffect } from "react";

const ChatbotBubble: React.FC = () => {
  useEffect(() => {
    // Load the chatbot script
    const script = document.createElement("script");
    script.defer = true;
    script.id = "chatbot-script";
    script.src = "https://cdn.aichatbotjs.com/chatbot.js";
    script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
    
    // Add the script to the body
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible, just loads the script
};

export default ChatbotBubble;
