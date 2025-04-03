
import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

const ChatbotBubble: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load the chatbot script
    const script = document.createElement("script");
    script.defer = true;
    script.id = "chatbot-script";
    script.src = "https://cdn.aichatbotjs.com/chatbot.js";
    script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
    
    // Set up event listener to know when chatbot is ready
    script.onload = () => {
      console.log("Chatbot script loaded");
      setIsLoaded(true);
    };
    
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

  const handleOpenChat = () => {
    console.log("Attempting to open chatbot");
    console.log("Window.ChatbotComponent:", window.ChatbotComponent);
    
    // Try multiple ways to open the chatbot
    if (window.ChatbotComponent && typeof window.ChatbotComponent.open === 'function') {
      console.log("Opening chatbot via ChatbotComponent.open()");
      window.ChatbotComponent.open();
    } else if (window.ChatbotComponent && window.ChatbotComponent.toggle) {
      console.log("Opening chatbot via ChatbotComponent.toggle()");
      window.ChatbotComponent.toggle();
    } else if (window.openChatbot) {
      console.log("Opening chatbot via openChatbot()");
      window.openChatbot();
    } else {
      console.log("Could not find method to open chatbot, dispatching custom event");
      // Try dispatching a custom event that the chatbot might be listening for
      const event = new CustomEvent('open-chatbot');
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button 
        className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
        aria-label="Chat with us"
        title="Chat with us"
        onClick={handleOpenChat}
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
      toggle?: () => void;
    };
    openChatbot?: () => void;
  }
}

export default ChatbotBubble;
