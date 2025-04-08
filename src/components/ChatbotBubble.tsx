
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/context/TranslationContext";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  const { language } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  
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

        // Get the script container in the head
        const scriptContainer = document.getElementById('chatbot-script-container');
        if (!scriptContainer) {
          console.error("Chatbot script container not found in the document head");
          return;
        }
        
        // Clear the container first
        scriptContainer.innerHTML = '';
        
        // Create a script element directly - THIS IS KEY
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        
        // If there's a language attribute, try to update it based on current language
        let modifiedCode = chatbotCode;
        if (language && language !== 'it') {
          // Try to modify language settings if it's present in the string
          modifiedCode = modifiedCode.replace(/data-lang="[^"]*"/, `data-lang="${language}"`);
          modifiedCode = modifiedCode.replace(/data-language="[^"]*"/, `data-language="${language}"`);
        }
        
        // For direct script tag, we need to extract attributes from the script tag
        // and apply them to our created script element
        if (modifiedCode.includes('<script')) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = modifiedCode;
          const scriptTag = tempDiv.querySelector('script');
          
          if (scriptTag) {
            // Copy all attributes from the parsed script
            Array.from(scriptTag.attributes).forEach(attr => {
              scriptElement.setAttribute(attr.name, attr.value);
            });
            
            // Execute script by setting its src (preferred) or content
            if (scriptTag.src) {
              scriptElement.src = scriptTag.src;
            } else if (scriptTag.textContent) {
              scriptElement.textContent = scriptTag.textContent;
            }
            
            // Append to document head to execute
            scriptContainer.appendChild(scriptElement);
            console.log("Chatbot script injected with proper attributes");
            setIsLoaded(true);
          } else {
            // Fallback: just use the string directly if no script tag found
            scriptContainer.innerHTML = modifiedCode;
            console.log("Chatbot script injected as raw HTML");
            setIsLoaded(true);
          }
        } else {
          // If it's not wrapped in a script tag, assume it's raw script content
          scriptElement.textContent = modifiedCode;
          scriptContainer.appendChild(scriptElement);
          console.log("Chatbot script injected as raw script content");
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading chatbot:", error);
      }
    };
    
    loadChatbot();
    
    // Reload chatbot when language changes or when page route changes
    return () => {
      setIsLoaded(false);
    };
  }, [isAdminPage, language, location.pathname]);

  // This component doesn't render anything visible
  return null;
};

export default ChatbotBubble;
