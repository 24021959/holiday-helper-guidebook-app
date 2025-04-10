
import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, X, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/context/TranslationContext';
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatbotConfig {
  enabled: boolean;
  welcomeMessage: Record<string, string>;
  primaryColor: string;
  secondaryColor: string;
  botName: string;
  position: 'right' | 'left';
  iconType: 'default' | 'custom';
  customIconUrl?: string;
}

const defaultConfig: ChatbotConfig = {
  enabled: true,
  welcomeMessage: {
    it: "Ciao! Sono qui per aiutarti. Come posso assisterti oggi?",
    en: "Hi! I'm here to help. How can I assist you today?",
    fr: "Bonjour! Je suis là pour vous aider. Comment puis-je vous aider aujourd'hui?",
    es: "¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo ayudarte hoy?",
    de: "Hallo! Ich bin hier um zu helfen. Wie kann ich Ihnen heute helfen?"
  },
  primaryColor: "#4ade80",
  secondaryColor: "#ffffff",
  botName: "Assistente Virtuale",
  position: 'right',
  iconType: 'default'
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();
  const [initializing, setInitializing] = useState(true);
  
  // Load chatbot configuration
  useEffect(() => {
    const loadConfig = async () => {
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
          // Use default config
        } else if (data) {
          // Ensure position is valid
          const configValue = data.value as Partial<ChatbotConfig>;
          const position = configValue.position === 'left' ? 'left' : 'right';
          
          setConfig({
            ...defaultConfig,
            ...configValue,
            position
          });
        }
      } catch (error) {
        console.error("Error in loading chatbot config:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadConfig();
  }, []);

  // Add welcome message
  useEffect(() => {
    if (!initializing && !messages.length) {
      const welcomeMessage = config.welcomeMessage[language] || config.welcomeMessage.en || "Hi! How can I help you today?";
      
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [language, initializing, config]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Transform chat history to the format expected by the API
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message, 
          language,
          chatHistory
        }
      });

      if (error) throw error;

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Mi dispiace, ho avuto un problema nel rispondere. Riprova più tardi o contatta direttamente la struttura.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If chatbot is disabled, don't render
  if (!config.enabled) return null;

  // Apply custom styles
  const getCustomStyles = () => {
    const position = config.position || 'right';
    return {
      bubbleButton: {
        backgroundColor: config.primaryColor,
      },
      header: {
        backgroundColor: config.primaryColor,
      }
    };
  };

  const styles = getCustomStyles();

  return (
    <>
      {/* Chatbot UI */}
      <div className="chatbot-wrapper">
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 mb-2 w-[340px] rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col bg-white"
              style={{ 
                [config.position === 'left' ? 'left' : 'right']: '20px',
                maxHeight: 'calc(100vh - 160px)',
              }}
            >
              {/* Chat Header */}
              <div 
                className="flex items-center justify-between p-3 text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                <div className="flex items-center space-x-2">
                  <Bot size={18} />
                  <span className="font-medium">{config.botName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-start max-w-[80%]">
                      {msg.role === 'assistant' && (
                        <Avatar className="mr-2 h-8 w-8 mt-1">
                          <AvatarFallback style={{ backgroundColor: config.primaryColor }}>
                            <Bot size={16} className="text-white" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <Avatar className="ml-2 h-8 w-8 mt-1">
                          <AvatarFallback className="bg-blue-600">
                            <User size={16} className="text-white" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="flex items-start max-w-[80%]">
                      <Avatar className="mr-2 h-8 w-8 mt-1">
                        <AvatarFallback style={{ backgroundColor: config.primaryColor }}>
                          <Bot size={16} className="text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                          <span className="text-sm text-gray-500">Scrivendo...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="h-10 w-10 rounded-full"
                    style={{ 
                      backgroundColor: message.trim() ? config.primaryColor : 'transparent',
                      color: message.trim() ? 'white' : '#888',
                    }}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center rounded-full w-14 h-14 shadow-lg"
          style={{ backgroundColor: config.primaryColor }}
        >
          {isOpen ? (
            <ChevronDown className="h-6 w-6 text-white" />
          ) : (
            config.iconType === 'custom' && config.customIconUrl ? (
              <img src={config.customIconUrl} alt="Chatbot" className="h-8 w-8" />
            ) : (
              <MessageSquare className="h-6 w-6 text-white" />
            )
          )}
        </motion.button>
      </div>
    </>
  );
};

export default Chatbot;
