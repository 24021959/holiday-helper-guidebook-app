
import React, { useEffect } from "react";
import { MessageCircle } from "lucide-react";

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

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button 
        className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
        aria-label="Chat with us"
        title="Chat with us"
        onClick={() => {
          // Trigger the chatbot to open if it's loaded
          if (window.ChatbotComponent && window.ChatbotComponent.open) {
            window.ChatbotComponent.open();
          }
        }}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

// Add this for TypeScript
declare global {
  interface Window {
    ChatbotComponent?: {
      open?: () => void;
    };
  }
}

export default ChatbotBubble;
