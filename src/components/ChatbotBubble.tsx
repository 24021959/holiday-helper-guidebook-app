
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  
  // Skip rendering on admin pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  useEffect(() => {
    if (isAdminPage || isLoaded) return;
    
    const loadChatbot = async () => {
      try {
        console.log("Attempting to load chatbot script...");
        
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
        
        if (!chatbotCode) {
          console.log("No chatbot code found, skipping...");
          return;
        }

        // Extract <script> tag and attributes from the code
        const parser = new DOMParser();
        const doc = parser.parseFromString(chatbotCode, 'text/html');
        const scriptTag = doc.querySelector('script');
        
        if (!scriptTag) {
          console.warn("Invalid chatbot code (no script tag found)");
          return;
        }
        
        // Create and append the script element
        const script = document.createElement('script');
        
        // Copy all attributes from the provided script
        Array.from(scriptTag.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        
        // Set source if present
        if (scriptTag.src) {
          script.src = scriptTag.src;
        }
        
        // Set inner content if present
        if (scriptTag.textContent) {
          script.textContent = scriptTag.textContent;
        }
        
        // Add error handling
        script.onerror = () => {
          console.error("Error loading chatbot script");
          setScriptError(true);
        };
        
        // Add load handler
        script.onload = () => {
          console.log("Chatbot script loaded successfully");
          setIsLoaded(true);
        };
        
        // Add the script to the document
        document.head.appendChild(script);
        console.log("Chatbot script appended to document head");
        
      } catch (error) {
        console.error("Error loading chatbot:", error);
        setScriptError(true);
      }
    };
    
    loadChatbot();
    
    // Attempt to reload chatbot after 2 seconds if not loaded initially
    // This helps with some chatbot providers that have timing issues
    const retryTimer = setTimeout(() => {
      if (!isLoaded && !scriptError) {
        console.log("Retrying chatbot script load...");
        loadChatbot();
      }
    }, 2000);
    
    return () => {
      clearTimeout(retryTimer);
    };
  }, [isAdminPage, isLoaded, scriptError]);

  // This component doesn't render anything visible
  return null;
};

export default ChatbotBubble;
