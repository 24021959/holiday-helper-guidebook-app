
import { useState, useCallback, useEffect } from 'react';
import { Message } from './chatbotTypes';
import { useTranslation } from '@/context/TranslationContext';

export const useChatMessages = (initializing: boolean, configWelcomeMessage: Record<string, string>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useTranslation();

  // Initialize welcome message when chatbot is ready
  useEffect(() => {
    if (!initializing && !messages.length) {
      const welcomeMessage = configWelcomeMessage[language] || 
                            configWelcomeMessage.en || 
                            "Hi! How can I help you today?";
      
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [language, initializing, configWelcomeMessage, messages.length]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    isLoading,
    setIsLoading
  };
};
