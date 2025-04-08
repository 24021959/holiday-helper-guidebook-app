
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

        // Create and append a new script element instead of using innerHTML
        // This is safer and avoids syntax errors with script content
        const scriptContainer = document.getElementById('chatbot-script-container');
        if (scriptContainer) {
          // Clean any previous scripts
          while (scriptContainer.firstChild) {
            scriptContainer.removeChild(scriptContainer.firstChild);
          }
          
          // Create a new script element
          const scriptElement = document.createElement('script');
          
          // If there's a language attribute, try to update it based on current language
          let modifiedCode = chatbotCode;
          
          if (language && language !== 'it') {
            // Try to modify language settings if it's present in the string
            modifiedCode = modifiedCode.replace(/data-lang="[^"]*"/, `data-lang="${language}"`);
            modifiedCode = modifiedCode.replace(/data-language="[^"]*"/, `data-language="${language}"`);
          }
          
          // Set the script content
          scriptElement.innerHTML = modifiedCode;
          scriptElement.type = 'text/javascript';
          
          // Append to the container
          scriptContainer.appendChild(scriptElement);
          
          console.log("Chatbot script injected into document head");
          setIsLoaded(true);
        } else {
          console.error("Chatbot script container not found in the document head");
        }
      } catch (error) {
        console.error("Error loading chatbot:", error);
      }
    };
    
    loadChatbot();
    
    // Reload chatbot when language changes
    return () => {
      if (isLoaded) {
        setIsLoaded(false);
      }
    };
  }, [isAdminPage, language, isLoaded]);

  // This component doesn't render anything visible
  return null;
};

export default ChatbotBubble;
