import React, { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ChatbotBubble: React.FC = () => {
  const [chatbotCode, setChatbotCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const chatbotInitialized = useRef(false);
  const location = useLocation();
  
  useEffect(() => {
    // Hide the chatbot on admin pages
    const isAdminPage = location.pathname.includes('/admin') || location.pathname.includes('/login');
    setIsVisible(!isAdminPage);
    
    // Only load and initialize the chatbot if we're not on an admin page
    if (!isAdminPage) {
      loadChatbotSettings();
    } else if (chatbotInitialized.current) {
      // If we're navigating to an admin page and the chatbot was previously initialized
      // Remove the script and container
      cleanupChatbot();
      chatbotInitialized.current = false;
    }
  }, [location.pathname]);
  
  const cleanupChatbot = () => {
    // Remove any existing chatbot script
    const existingScript = document.getElementById("chatbot-script");
    if (existingScript) {
      existingScript.remove();
    }
    
    // Clean up any existing container
    const existingContainer = document.getElementById("chatbot-container");
    if (existingContainer) {
      existingContainer.innerHTML = '';
    }
  };
  
  const loadChatbotSettings = async () => {
    try {
      // First try to get from localStorage (faster)
      let code = localStorage.getItem("chatbotCode");
      
      // If not in localStorage, try Supabase
      if (!code) {
        const { data, error } = await supabase
          .from('chatbot_settings')
          .select('code')
          .eq('id', 1)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.warn("Errore nel caricamento delle impostazioni chatbot:", error);
        }
        
        code = data?.code || null;
        
        // Save to localStorage for future use
        if (code) {
          localStorage.setItem("chatbotCode", code);
        }
      }
      
      setChatbotCode(code);
      
      // If we have a valid code from either localStorage or Supabase, initialize
      // Otherwise, initialize the default chatbot
      if (code && code.trim() !== '' && code.includes('<script')) {
        initializeChatbot(code);
      } else {
        // If no valid code is configured, load the default chatbot
        initializeDefaultChatbot();
      }
    } catch (error) {
      console.error("Errore nel caricamento delle impostazioni chatbot:", error);
      // Fallback to default chatbot
      initializeDefaultChatbot();
    }
  };
  
  const initializeChatbot = (code: string) => {
    try {
      // Clean up first
      cleanupChatbot();
      
      // Create container if it doesn't exist
      if (!document.getElementById("chatbot-container")) {
        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "chatbot-container";
        document.body.appendChild(chatbotContainer);
      }
      
      // Extract script src and data attributes
      const srcMatch = code.match(/src=['"](.*?)['"]/);
      const dataIdMatch = code.match(/data-chatbot-id=['"](.*?)['"]/);
      
      if (srcMatch && srcMatch[1]) {
        const script = document.createElement("script");
        script.id = "chatbot-script";
        script.defer = true;
        script.src = srcMatch[1];
        
        if (dataIdMatch && dataIdMatch[1]) {
          script.setAttribute("data-chatbot-id", dataIdMatch[1]);
        }
        
        script.setAttribute("data-element", "chatbot-container");
        script.setAttribute("data-position", "right");
        
        // Add to document and mark as initialized
        document.head.appendChild(script);
        chatbotInitialized.current = true;
        console.log("Chatbot script aggiunto con successo:", script.src);
      } else {
        throw new Error("URL dello script chatbot non trovato nel codice");
      }
    } catch (error) {
      console.error("Errore nell'inizializzazione del chatbot:", error);
      toast.error("Errore nell'inizializzazione del chatbot");
      // Fallback to default
      initializeDefaultChatbot();
    }
  };
  
  const initializeDefaultChatbot = () => {
    try {
      // Clean up first
      cleanupChatbot();
      
      // Create container if it doesn't exist
      if (!document.getElementById("chatbot-container")) {
        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "chatbot-container";
        document.body.appendChild(chatbotContainer);
      }
      
      // Set up default script - using a reliable, working chatbot service
      const script = document.createElement("script");
      script.id = "chatbot-script";
      script.defer = true;
      script.src = "https://cdn.aichatbotjs.com/chatbot.js";
      script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
      script.setAttribute("data-element", "chatbot-container");
      script.setAttribute("data-position", "right");
      
      document.head.appendChild(script);
      chatbotInitialized.current = true;
      console.log("Script del chatbot predefinito aggiunto");
    } catch (error) {
      console.error("Errore nell'inizializzazione del chatbot predefinito:", error);
    }
  };

  const handleOpenChat = () => {
    console.log("Tentativo di aprire il chatbot...");
    
    try {
      // Try multiple approaches to open the chatbot
      
      // 1. Click on any chatbot UI elements that might be present
      const buttons = document.querySelectorAll('button[aria-label*="chat"], div[class*="chat-button"], div[class*="chatbot"]');
      for (const button of Array.from(buttons)) {
        if (button instanceof HTMLElement && button.offsetParent !== null) {
          console.log("Elemento chatbot trovato, tentativo di apertura:", button);
          button.click();
          return;
        }
      }
      
      // 2. Try calling global methods if they exist
      if (window.ChatbotComponent?.open) {
        window.ChatbotComponent.open();
        return;
      }
      
      if (window.ChatbotComponent?.toggle) {
        window.ChatbotComponent.toggle();
        return;
      }
      
      if (window.openChatbot) {
        window.openChatbot();
        return;
      }
      
      // 3. Emit global event
      const openEvent = new CustomEvent("open-chatbot");
      window.dispatchEvent(openEvent);
      
      // 4. If nothing worked, try to reinitialize the chatbot
      if (!chatbotInitialized.current) {
        console.log("Chatbot non inizializzato, reinizializzazione in corso...");
        if (chatbotCode) {
          initializeChatbot(chatbotCode);
        } else {
          initializeDefaultChatbot();
        }
        
        // Delay to give the script time to load
        setTimeout(() => {
          // Try one more time to find and click any chat elements
          const chatElements = document.querySelectorAll('[class*="chat"], [id*="chat"], [aria-label*="chat"]');
          for (const element of Array.from(chatElements)) {
            if (element instanceof HTMLElement && element.offsetParent !== null) {
              console.log("Elemento chatbot trovato dopo reinizializzazione:", element);
              element.click();
              return;
            }
          }
        }, 1000);
      }
      
      // 5. Show a notification to the user
      toast.info("Chatbot in caricamento", {
        description: "Il chatbot sta per aprirsi, attendi un momento...",
        duration: 3000
      });
    } catch (error) {
      console.error("Errore durante l'apertura del chatbot:", error);
      toast.error("Errore chatbot", {
        description: "Impossibile aprire il chatbot. Riprova più tardi.",
        duration: 5000
      });
    }
  };

  // Don't show the bubble if we're on an admin page
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button 
        className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
        aria-label="Chatta con noi"
        title="Chatta con noi"
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
