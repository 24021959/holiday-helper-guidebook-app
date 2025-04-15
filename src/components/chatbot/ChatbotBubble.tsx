
import React from 'react';
import { useChatbot } from "@/hooks/useChatbot";
import Chatbot from "./Chatbot";
import { Bot, X } from 'lucide-react';

const ChatbotBubble: React.FC = () => {
  const { 
    isOpen, 
    toggleChat, 
    config, 
    initializing 
  } = useChatbot();

  // Hide bubble when initializing
  if (initializing || !config.enabled) {
    return null;
  }
  
  return (
    <>
      {/* Chatbot interface */}
      {isOpen && (
        <div className="fixed bottom-20 z-50 max-h-[calc(100vh-100px)] w-full max-w-md shadow-xl rounded-lg overflow-hidden transition-all duration-300"
           style={{ 
             [config.position === 'right' ? 'right' : 'left']: '20px',
           }}>
          <Chatbot />
        </div>
      )}
      
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        style={{ 
          backgroundColor: config.primaryColor,
          [config.position === 'right' ? 'right' : 'left']: '20px',
        }}
        aria-label={isOpen ? "Chiudi chat" : "Apri chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          config.iconType === 'custom' && config.customIconUrl ? (
            <img src={config.customIconUrl} alt="Chat icon" className="h-6 w-6" />
          ) : (
            <Bot className="h-6 w-6 text-white" />
          )
        )}
      </button>
    </>
  );
};

export default ChatbotBubble;
