
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";
import { supabase } from "@/integrations/supabase/client";

const ChatbotBubble: React.FC = () => {
  const location = useLocation();
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadChatbotConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'chatbot_config')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // not found error
            console.error("Error loading chatbot config:", error);
          }
          // Default to enabled if not found
        } else if (data && data.value) {
          setChatbotEnabled(data.value.enabled !== false);
        }
      } catch (error) {
        console.error("Error in loading chatbot config:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatbotConfig();
  }, []);
  
  // Hide the chatbot on admin and login pages
  const isAdminPage = location.pathname.includes('/admin') || 
                       location.pathname.includes('/login');

  // If it's an admin page or loading or disabled, don't show the chatbot
  if (isAdminPage || loading || !chatbotEnabled) {
    return null;
  }

  // Otherwise, show the Chatbot component
  return <Chatbot />;
};

export default ChatbotBubble;
