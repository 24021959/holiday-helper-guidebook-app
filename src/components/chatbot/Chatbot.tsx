
import React from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import ChatBox from './ChatBox';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown } from 'lucide-react';

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

interface ChatbotProps {
  previewConfig?: ChatbotConfig;
}

export const Chatbot: React.FC<ChatbotProps> = ({ previewConfig }) => {
  const {
    isOpen,
    messages,
    isLoading,
    config,
    sendMessage,
    toggleChat,
    initializing
  } = useChatbot(previewConfig);

  if (initializing) return null;

  const getCustomStyles = () => {
    const position = config.position || 'right';
    return {
      container: {
        [position]: '20px',
      }
    };
  };

  const styles = getCustomStyles();

  return (
    <>
      <div 
        className={`fixed bottom-6 z-50 ${config.position === 'left' ? 'left-6' : 'right-6'}`}
        style={styles.container}
      >
        <AnimatePresence>
          {isOpen && (
            <ChatBox 
              messages={messages}
              isLoading={isLoading}
              config={config}
              onSendMessage={sendMessage}
              onClose={toggleChat}
            />
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
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
