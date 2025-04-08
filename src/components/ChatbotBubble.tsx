import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/context/TranslationContext";
import { useToast } from "@/hooks/use-toast";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  const { language } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  // Skip rendering on admin pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  useEffect(() => {
    if (isAdminPage) return;
    
    // Reset loaded state when route changes
    setIsLoaded(false);
    
    const loadChatbot = async () => {
      try {
        console.log("Loading chatbot for path:", location.pathname);
        
        // Try to load from localStorage first (faster and more reliable)
        const localCode = localStorage.getItem("chatbotCode");
        let chatbotCode = localCode;
        
        // If not in localStorage, try to load from Supabase
        if (!chatbotCode) {
          console.log("No chatbot code in localStorage, trying Supabase...");
          try {
            const { data, error } = await supabase
              .from('chatbot_settings')
              .select('code')
              .eq('id', 1)
              .maybeSingle();
              
            if (error) {
              console.warn("Failed to load from Supabase:", error);
            } else if (data && data.code) {
              chatbotCode = data.code;
              // Store in localStorage for future use
              localStorage.setItem("chatbotCode", data.code);
            }
          } catch (error) {
            console.warn("Supabase request failed:", error);
          }
        }
        
        // If no saved code, use the default SupportFast code
        if (!chatbotCode) {
          chatbotCode = '<script defer id="supportfast-script" src="https://cdn.supportfast.ai/chatbot.js" data-chatbot-id="bot-ufqmgj3gyj"></script>';
          localStorage.setItem("chatbotCode", chatbotCode);
          console.log("Using default SupportFast chatbot code");
        }

        // Remove any existing chatbot scripts to prevent duplicates
        const existingScripts = document.querySelectorAll('[data-chatbot-script="true"]');
        existingScripts.forEach(script => script.remove());
        
        // Also clean any existing SupportFast elements
        const existingSupportFastElements = document.querySelectorAll('.supportfast-container, .supportfast-bubble, .supportfast-widget');
        existingSupportFastElements.forEach(el => el.remove());
        
        // Insert the script directly into the body
        if (chatbotCode.includes('<script')) {
          console.log("Adding script tag directly");
          const scriptElement = document.createElement('script');
          scriptElement.setAttribute('data-chatbot-script', 'true');
          scriptElement.defer = true;
          scriptElement.id = "supportfast-script";
          scriptElement.src = "https://cdn.supportfast.ai/chatbot.js";
          scriptElement.setAttribute('data-chatbot-id', 'bot-ufqmgj3gyj');
          document.body.appendChild(scriptElement);
        } else {
          console.log("Adding raw code:", chatbotCode);
          const scriptElement = document.createElement('script');
          scriptElement.setAttribute('data-chatbot-script', 'true');
          scriptElement.textContent = chatbotCode;
          document.body.appendChild(scriptElement);
        }
        
        // Add debugging info
        console.log("Chatbot script injection complete");
        setIsLoaded(true);
        
        // Add a visible debug element on the page in development
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
          debugDiv.textContent = 'Chatbot loaded: ' + new Date().toISOString();
          document.body.appendChild(debugDiv);
        }
      } catch (error) {
        console.error("Error loading chatbot:", error);
      }
    };
    
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadChatbot();
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [isAdminPage, language, location.pathname]);

  // Check for the chat bubble every second and ensure it's visible
  useEffect(() => {
    if (isAdminPage) return;
    
    const ensureChatbotVisible = () => {
      try {
        // Target SupportFast elements specifically
        const chatElements = document.querySelectorAll('.supportfast-container, .supportfast-bubble, .supportfast-widget, .supportfast-chat');
        
        if (chatElements.length > 0) {
          console.log("Found chatbot elements, ensuring visibility");
          chatElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.zIndex = '9999';
              el.style.display = 'block';
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.pointerEvents = 'auto';
            }
          });
        }
      } catch (error) {
        console.error("Error in visibility check:", error);
      }
    };
    
    const visibilityInterval = setInterval(ensureChatbotVisible, 1000);
    
    return () => {
      clearInterval(visibilityInterval);
    };
  }, [isAdminPage]);

  // Just a placeholder element to ensure the component is mounted
  return (
    <div id="chatbot-container" style={{ display: 'none' }}>
      {isLoaded ? 'Chatbot loaded' : 'Chatbot not loaded'}
    </div>
  );
};

export default ChatbotBubble;
