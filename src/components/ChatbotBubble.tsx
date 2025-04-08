
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
        
        if (!chatbotCode) {
          console.log("No chatbot code found, skipping...");
          return;
        }

        // Remove any existing chatbot scripts to prevent duplicates
        const existingScripts = document.querySelectorAll('[data-chatbot-script="true"]');
        existingScripts.forEach(script => script.remove());
        
        // Also try targeting the script container
        const scriptContainer = document.getElementById('chatbot-script-container');
        if (scriptContainer) {
          // Use the script container approach - this often works better for third-party chatbots
          scriptContainer.innerHTML = chatbotCode;
          const addedScripts = scriptContainer.querySelectorAll('script');
          addedScripts.forEach(script => {
            script.setAttribute('data-chatbot-script', 'true');
          });
          console.log("Chatbot script added to designated container");
        } else {
          // Fallback: Process the chatbot code directly
          if (chatbotCode.includes('<script')) {
            // Extract the script content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = chatbotCode;
            const scriptTags = tempDiv.querySelectorAll('script');
            
            scriptTags.forEach(scriptTag => {
              const scriptElement = document.createElement('script');
              scriptElement.setAttribute('data-chatbot-script', 'true');
              
              // Copy all attributes
              Array.from(scriptTag.attributes).forEach(attr => {
                scriptElement.setAttribute(attr.name, attr.value);
              });
              
              // If language is specified and different from default, try to update
              if (language && language !== 'it') {
                if (scriptElement.getAttribute('data-lang')) {
                  scriptElement.setAttribute('data-lang', language);
                }
                if (scriptElement.getAttribute('data-language')) {
                  scriptElement.setAttribute('data-language', language);
                }
              }
              
              // Set content or src
              if (scriptTag.src) {
                scriptElement.src = scriptTag.src;
              } else {
                scriptElement.textContent = scriptTag.textContent;
              }
              
              // Add to document head
              document.head.appendChild(scriptElement);
              console.log("Chatbot script injected with attributes:", 
                Array.from(scriptElement.attributes).map(a => `${a.name}="${a.value}"`).join(' '));
            });
          } else {
            // Direct script content
            const scriptElement = document.createElement('script');
            scriptElement.setAttribute('data-chatbot-script', 'true');
            scriptElement.textContent = chatbotCode;
            document.head.appendChild(scriptElement);
          }
        }
        
        console.log("Chatbot script injection complete");
        setIsLoaded(true);
        
        // Add a visible debug element on the page
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
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadChatbot();
    }, 1000); // Increased timeout to ensure page is fully loaded
    
    return () => {
      clearTimeout(timer);
    };
  }, [isAdminPage, language, location.pathname]);

  // Just a placeholder element to ensure the component is mounted
  return (
    <div id="chatbot-container" style={{ display: 'none' }}>
      {isLoaded ? 'Chatbot loaded' : 'Chatbot not loaded'}
    </div>
  );
};

export default ChatbotBubble;
