
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
    if (!isAdminPage && !chatbotInitialized.current) {
      loadChatbotSettings();
    }
  }, [location.pathname]);
  
  const loadChatbotSettings = async () => {
    try {
      // First try to get from Supabase (most up-to-date)
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('code')
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.warn("Errore nel caricamento delle impostazioni chatbot:", error);
      }
      
      let code = data?.code;
      
      // Fallback to localStorage if Supabase fails
      if (!code) {
        code = localStorage.getItem("chatbotCode");
      }
      
      setChatbotCode(code);
      
      if (code) {
        initializeChatbot(code);
      } else {
        // If no code is configured, load the default chatbot
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
      // Remove any existing chatbot script
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
      }
      
      // Clean up any existing container
      const existingContainer = document.getElementById("chatbot-container");
      if (existingContainer) {
        existingContainer.innerHTML = '';
      } else {
        // Create container if it doesn't exist
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
    }
  };
  
  const initializeDefaultChatbot = () => {
    try {
      // Remove any existing script
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
      }
      
      // Set up default script
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
      
      // Ensure container exists
      if (!document.getElementById("chatbot-container")) {
        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "chatbot-container";
        document.body.appendChild(chatbotContainer);
      }
    } catch (error) {
      console.error("Errore nell'inizializzazione del chatbot predefinito:", error);
    }
  };

  const handleOpenChat = () => {
    console.log("Tentativo di aprire il chatbot...");
    
    try {
      // Try multiple approaches to open the chatbot
      
      // 1. Try calling global methods if they exist
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
      
      // 2. Emit global event
      const openEvent = new CustomEvent("open-chatbot");
      window.dispatchEvent(openEvent);
      
      // 3. Try to find and click chatbot elements
      const chatbotElements = [
        document.querySelector(".chatbot-widget"),
        document.querySelector(".chatbot-launcher"),
        document.querySelector("iframe[id*='chatbot']"),
        document.querySelector("[data-botid]"),
        document.querySelector("[id*='chatbot']"),
        document.querySelector("[class*='chatbot']"),
        document.querySelector(".bot-button"),
        document.querySelector(".bot-icon"),
        document.querySelector(".chatbot-button"),
        document.querySelector(".chat-button")
      ];
      
      for (const element of chatbotElements) {
        if (element) {
          console.log("Elemento chatbot trovato, tentativo di apertura:", element);
          if (element instanceof HTMLElement) {
            element.click();
            element.style.display = "block";
            element.style.visibility = "visible";
            element.style.opacity = "1";
            return;
          }
        }
      }
      
      // 4. If all else fails, reinitialize the chatbot
      console.log("Nessun elemento chatbot trovato, reinizializzazione in corso...");
      if (chatbotCode) {
        initializeChatbot(chatbotCode);
      } else {
        initializeDefaultChatbot();
      }
      
      // 5. Notify user
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

  // Non mostrare il bubble se siamo in una pagina admin
  if (!isVisible) {
    return null;
  }

  return (
    <>
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
    </>
  );
};

// Aggiungi questo per TypeScript
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
