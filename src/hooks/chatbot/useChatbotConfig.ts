
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ChatbotConfig, defaultConfig } from './chatbotTypes';

export const useChatbotConfig = (previewConfig?: ChatbotConfig) => {
  const [config, setConfig] = useState<ChatbotConfig>(previewConfig || defaultConfig);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      setInitializing(false);
      return;
    }
    
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'chatbot_config')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error("Error loading chatbot config:", error);
          }
        } else if (data) {
          setConfig({
            ...defaultConfig,
            ...data.value as ChatbotConfig
          });
        }
      } catch (error) {
        console.error("Error in loading chatbot config:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadConfig();
  }, [previewConfig]);

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
    }
  }, [previewConfig]);

  return {
    config,
    setConfig,
    initializing
  };
};
