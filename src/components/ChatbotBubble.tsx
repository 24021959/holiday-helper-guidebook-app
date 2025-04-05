import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if we're on an admin page to not show chatbot there
    const isAdminPage = location.pathname.includes("/admin");
    setIsAdmin(isAdminPage);

    // If we're on admin page, don't load the chatbot
    if (isAdminPage) {
      return;
    }

    const loadChatbotSettings = async () => {
      try {
        // First try to load from Supabase
        const { data, error } = await supabase
          .from('chatbot_settings')
          .select('code')
          .eq('id', 1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.warn("Errore nel caricamento delle impostazioni chatbot:", error);
          return;
        }

        let chatbotCode = '';
        
        // Use data from Supabase if available
        if (data && data.code) {
          chatbotCode = data.code;
        } 
        // Otherwise, check localStorage as fallback
        else {
          const localStorageCode = localStorage.getItem("chatbotCode");
          if (localStorageCode) {
            chatbotCode = localStorageCode;
          }
        }

        // If we have chatbot code, initialize it
        if (chatbotCode && !isLoaded) {
          initializeChatbot(chatbotCode);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading chatbot settings:", error);
      }
    };

    loadChatbotSettings();
  }, [location.pathname, isLoaded]);

  const initializeChatbot = (chatbotCode: string) => {
    try {
      // Remove existing script if any
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Create container if it doesn't exist
      if (!document.getElementById("chatbot-container")) {
        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "chatbot-container";
        document.body.appendChild(chatbotContainer);
      }

      // Extract script details
      const srcMatch = chatbotCode.match(/src=['"](.*?)['"]/);
      const dataIdMatch = chatbotCode.match(/data-chatbot-id=['"](.*?)['"]/);
      
      if (srcMatch && srcMatch[1]) {
        // Create new script element
        const script = document.createElement("script");
        script.id = "chatbot-script";
        script.defer = true;
        script.src = srcMatch[1];
        
        if (dataIdMatch && dataIdMatch[1]) {
          script.setAttribute("data-chatbot-id", dataIdMatch[1]);
        }
        
        script.setAttribute("data-element", "chatbot-container");
        script.setAttribute("data-position", "right");
        
        // Append to document
        document.head.appendChild(script);
        console.log("Chatbot inizializzato");
      } else {
        console.warn("Formato script chatbot non valido");
      }
    } catch (error) {
      console.error("Errore nell'inizializzazione del chatbot:", error);
    }
  };

  // If on admin page, don't render anything
  if (isAdmin) {
    return null;
  }

  // The chatbot will be inserted into the chatbot-container div
  return null;
};

export default ChatbotBubble;
